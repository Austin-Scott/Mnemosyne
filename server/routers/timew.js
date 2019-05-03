import express from 'express'
import { spawn } from 'child_process'
import terminal from '../terminal'
import { getDuration, parseZuluTimeString } from '../dates'

const timeWarrior = new express.Router()
/**
 * https://taskwarrior.org/docs/timewarrior/tutorial.html 
 * commands that I (may) want to play with:
 * timew start <tag> <tag> <tags are a list>
 * timew stop
 * timew summary (use export)
 * timew continue
 * timew tags
 * timew track <start time (am/pm)> - <end time (am/pm)>
 *   track is a particularly tricky case, will require 
 *   complex logic to work properly
 * changing previous tasks details is extremely complicated,
 * use the link above to determine what I want to do with that.
 *   NOTE: EDITING THE PAST USING TRACK IS A STRETCH-GOAL
 * 
 * USEFUL:
 * timew help <command>
 * timew help interval <- much needed
 * 
 * FORMATS:
 * date: YYYYMMDD will be all I want to use
 * time: hh:mm[:ss] seconds is optional, hours in military time
 * can be concatonated: YYYY-MM-DDThh:mm:ss - the 'T' indicates the change
 */

/**
 * Handle the start command 
 * 1. send the start signal
 * 2. pass all tags as an array
 */
timeWarrior.post('/start', (req, res) => {
  let operation = req.body
  // make sure the user sent data
  if (!Array.isArray(operation.args)) {
    res.json({
      success: false,
      stdout: '',
      stderr: 'Error: args must be passed to the body of the post request, please pass an empty array if no args exist'
    })
    return
  }
  // operation exists, spawn the command
  let command
  if (operation.args.length > 0) {
    command = spawn('timew', ['start'].concat(operation.args).concat([':yes']))
  } else {
    command = spawn('timew', ['start', ':yes'])
  }
  /**
   * stdout contains a string that is what was passed back
   * stderr (should be blank if it worked) contains information
   * code indicates errors or not
   */
  terminal.terminal(command, (stdout, stderr, code) => {
    process.stdout.write(`/start returned code: ${code}\nstdout:\n${stdout}\nstderr:\n${stderr}\n`)
    res.json({
      success: (code == 0),
      stdout: stdout,
      stderr: stderr
    })
    return
  })
}) // end of .post('/start')

/**
 * Handle the stop command
 * 1. send the stop command
 * 2. pass all tags in an array in the post body
 * Note: if the tags passed do not match a currently
 * running timer, then the output is going to stderr
 */
timeWarrior.post('/stop', (req, res) => {
  let operation = req.body
  // make sure the user sent data,
  // even if that was an empty array
  // operation exists, spawn the command
  if (!Array.isArray(operation.args)) {
    res.json({
      success: false,
      stdout: '',
      stderr: 'Error: args must be passed to the body of the post request, please pass an empty array if no args exist'
    })
    return
  }
  let command = spawn('timew', ['stop'].concat(operation.args).concat([':yes', ':quiet']))
  /**
   * stdout contains a string that is what was passed back
   * stderr (should be blank if it worked) contains information
   * code indicates errors or not
   */
  terminal.terminal(command, (stdout, stderr, code) => {
    process.stdout.write(`/stop returned code: ${code}\nstdout:\n${stdout}\nstderr:\n${stderr}\n`)
    res.json({
      success: (code == 0),
      stdout: stdout,
      stderr: stderr
    })
    return
  })
}) // end of .post('/stop')

/**
 * Retrive all the data
 */
timeWarrior.post('/summary', (req, res) => {
  let operation = req.body
  if (!Array.isArray(operation.tags)) {
    res.json({
      success: false,
      stdout: '',
      stderr: 'Error: args must be passed to the body of the post request, please pass an empty array if no args exist'
    })
    return
  }
  if (!Array.isArray(operation.intervals)) {
    res.json({
      success: false,
      stdout: '',
      stderr: 'Error: intervals must be passed to the body of the post request, please pass an empty array if no args exist'
    })
    return
  }
  // let arguments = ['export'].concat(operation.intervals).concat(operation.tags).concat([':yes'])
  let command = spawn('timew', ['export'].concat(operation.intervals).concat(operation.tags).concat([':yes']))
  terminal.terminal(command, (stdout, stderr, code) => {
    // stdout has a string which will be the exported JSON, if no error
    if (Number(code) === 0) {
      let timers = JSON.parse(stdout)
      timers = timers.map((timer) => {
        return ({
          start: parseZulluTimeString(timer.start).toString(),
          end: ((timer.end) ? parseZulluTimeString(timer.end).toString() : null),
          elapsed: (() => {
            if (!timer.end) {
              return null
            }
            // startDate and endDate are Date objects
            let startDate = parseZulluTimeString(timer.start)
            let endDate = parseZulluTimeString(timer.end)
            let duration = getDuration(startDate, endDate)
            return duration.toRelativeString()
          }),
          tags: ((Array.isArray(timer.tags)) ? timer.tags : []),
          status: ((timer.end) ? 'Completed' : 'Active')
        }) // end of map return statement
      }) // end of map function
    } // end of if statement
    else {
      res.JSON({
        success: false,
        code: code,
        stdout: stdout,
        stderr: stderr
      })
    }
  })
}) // end of .post('/summary')

/**
 * returns an array of all timers in timewarrior
 * the objects in the array contain:
 * 1. the start time as a human readable string
 * 2. the end time as a human readable string (or '--' if it doesn't exist)
 * 3. the time elapsed as a human readable string (or '--' if end is doesn't exist)
 * 4. the tags for the timer as an array of strings (the array may be empty)
 * 5. the status of the timer ('active' or 'complete')
 */
export function getAllTimers() {
  return new Promise ((resolve, reject) => {
    let command = spawn('timew', ['export'])
    terminal.terminal(command, (stdout, stderr, code) => {
      // stdout has a string which will be the exported JSON, if no error
      if (Number(code) === 0) {
        let timers = JSON.parse(stdout)
        let formattedTimers = timers.map((timer) => {
          // Generate the objects that describe the timer
          // Start always exists, so we can compare the two
          let startDate = parseZuluTimeString(timer.start)
          let startStr = startDate.toLocaleString('en-US')
          let endDate = null
          let endStr = '---'
          let elapsedTime = '---'
          let tagsArr = ((Array.isArray(timer.tags)) ? timer.tags : [])
          let statusStr = ''
          if (timer.end) {
            //timer.end exists, which mean we can get end and elapsed time
            endDate = parseZuluTimeString(timer.end)
            endStr = endDate.toLocaleString('en-US')
            elapsedTime = getDuration(startDate, endDate).toRelativeString()
            statusStr = 'Completed'
          } else {
            endDate = '---'
            elapsedTime = '---'
            statusStr = 'Active'
          }
          return ({
            start: startStr,
            end: endStr,
            elapsed: elapsedTime,
            tags: tagsArr,
            status: statusStr
          })
        })
        resolve(formattedTimers)
      } else {
        reject(new Error(`failed to run command: ${command}`))
      }
    })
  })
}

/**
 * return an array of all active timers in timewarrior
 * the objects in the array contain:
 * 1. start: the start time of the timer as a human readable string
 * 2. tags: an array of strings
 */
export function getActiveTimers() {
  return new Promise ((resolve, reject) => {
    let command = spawn('timew', ['export'])
    terminal.terminal(command, (stdout, stderr, code) => {
      // stdout has a string which will be the exported JSON, if no error
      if (Number(code) === 0) {
        let timers = JSON.parse(stdout)
        let activeTimers = timers.filter((timer) => {
          return (!timer.end) //end doesn't exist, which means the timer is still running
        })
        activeTimers = activeTimers.map((timer) => {
          // have a start time and an array of tags
          // the array of tags should be empty if there are no tags.
          let zuluDate = parseZuluTimeString(timer.start)
          let tagsArr = ((Array.isArray(timer.tags)) ? timer.tags : [])
          return ({
            start: zuluDate,
            tags: tagsArr
          })
        })
        resolve(activeTimers)
      } else {
        reject(new Error(`failed to run command: ${command}`))
      }
    })
  })
}

export default timeWarrior
