/**
 * This is where Evan has to do his job
 * 1. create an enpoint to start and stop timers
 * 2. enable specifying tasks
 * 3. enpoint to retrieve previous timers (timew export) for JSON
 */

 import express from 'express'
//  import fs from 'fs'
//  import path from 'path'
 import { spawn } from 'child_process'
 import terminal from '../terminal'
 import {getDuration, parseZulluTimeString } from '../dates'

 const timeWarror = new express.Router()

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
  timeWarror.post('/start', (req, res) => {
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
    let command = spawn('timew', ['start'].concat(operation.args).concat([':yes', ':quiet']))
    /**
     * stdout contains a string that is what was passed back
     * stderr (should be blank if it worked) contains information
     * code indicates errors or not
     */
    terminal.terminal(command, (stdout, stderr, code) => {
      res.json({
        success: (code == 0),
        stdout: stdout,
        stderr: stderr
      })
      return
    })
  })

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
      res.json({
        success: (code == 0),
        stdout: stdout,
        stderr: stderr
      })
      return
    })
  })

  /**
   * Retrive all the data
   * 
   * TODO: figure out what to do with the date strings in 
   * the operation.intervals array
   */
  timeWarror.post('/summary', (req, res) => {
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
    let arguments = ['export'].concat(operation.intervals).concat(operation.tags)
    arguments.concat([':yes'])
    let command = spawn('timew', arguments)
    terminal.terminal(command, (stdout, stderr, code) => {
      // stdout has a string which will be the exported JSON, if no error
      if (Number(code) === 0) {
        res.send(stdout)
      }
      else {
        res.JSON({
          success: false,
          code: code,
          stdout: stdout,
          stderr: stderr
        })
      }
    })

  })

  /**
   * TODO:
   * add function that returns an array of all active timers
   * add function that returns an array of all timers
   *  start, end, elapsed, tags, status
   *  elapsed and status have to be calculated in here
   * 
   * both functions need to convert start and end into human readable strings
   */

function getAllTimers () {
  let command = spawn('timew', ['export'])
  terminal.terminal(command, (stdout, stderr, code) => {
    // stdout has a string which will be the exported JSON, if no error
    if (Number(code) === 0) {
      let timers = JSON.parse(stdout)
      let formattedTimers = timers.map((timer, index) => {
        return ({
          start: parseZulluTimeString(timer.start).toString(),
          end: ((timer.end) ? parseZulluTimeString(timer.end).toString() : null),
          ellapsed: (() => {
            // startDate and endDate are Date objects
            let startDate = parseZulluTimeString(timer.start)
            let endDate = parseZulluTimeString(timer.end)
            let duration = getDuration(startDate, endDate)
            return duration.toRelativeString()
          }),
          tags: ((Array.isArray(timer.tags)) ? timer.tags : []),
          status: ((timer.end) ? 'Completed' : 'Active')
        })
      })
      return formattedTimers
    }
    else {
      // command failed
      return false
    }
  })
}

function getActiveTimers () {
  let command = spawn('timew', ['export'])
  terminal.terminal(command, (stdout, stderr, code) => {
    // stdout has a string which will be the exported JSON, if no error
    if (Number(code) === 0) {
      let timers = JSON.parse(stdout)
      let activeTimers = timers.map((timer, index))
    }
    else {
      // command failed
      return false
    }
  })
}