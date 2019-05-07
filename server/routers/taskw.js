import express from 'express'
import { spawn } from 'child_process'
import chalk from 'chalk'

import t from '../terminal'
import { getDurationUntilZuluString, parseZuluTimeString } from '../dates'

const taskw = new express.Router()

/**
 * 
 * @param {String} uuid Universally unique identifer of the task that you want to modify
 * @param {String} command Operation you wish to perform. Can be 'done', 'delete', 'modify', or 'edit'
 * @param {Array} args Array of strings of extra arguments that you with to pass to TaskWarrior
 */
function modifyTask(uuid, command, args) {
    return new Promise((resolve, reject)=>{
        let argList = command=='delete'?['delete', uuid]:[uuid, command]
        let stdin = undefined
        if(command=='delete') {
            stdin = 'yes\n'
        } else if(command=='modify') {
            stdin = 'no\n'
        }
        if(args) {
            argList=argList.concat(args)
        }
        t.terminal(spawntask(argList), (stdout, stderr, code)=>{
            resolve({
                success: code==0,
                stdout: stdout,
                stderr: stderr
            })
        }, stdin)
    })
}

/**
 * Handle modify task request
 */
taskw.post('/modify', (req, res)=>{
    console.log('Modify task request received')
    let op = req.body
    if(!op.type || !op.uuid) {
        res.json({
            success: false,
            stdout: '',
            stderr: 'Error: type and uuid must be set.'
        })
        return
    }

    if(op.type=='complete') {
        modifyTask(op.uuid, 'done').then((result)=>{
            res.json(result)
            return
        })
    } else if(op.type == 'delete') {
        modifyTask(op.uuid, 'delete').then((result)=>{
            res.json(result)
            return
        })
    } else if(op.type == 'update') {
        modifyTask(op.uuid, 'modify', [t.escapeBashCharacters(op.description)]).then((result)=>{
            res.json(result)
            return
        })
    } else if(op.type == 'makePending') {
        modifyTask(op.uuid, 'modify', ['status:pending', 'end:']).then((result)=>{
            res.json(result)
            return
        })
    } 

})

/**
 * Handle create new task request
 */
taskw.post('/create', (req, res)=>{
    let taskInfo = req.body
    console.log('Create new task request received')
    console.log(taskInfo)

    if(taskInfo.desc===undefined) {
        res.json({
            success: false,
            stdout: '',
            stderr: 'Error: desc must be set'
        })
        return
    }
    let args = ['add', t.escapeBashCharacters(taskInfo.desc)]

    if(taskInfo.dueDate.length==15) {
        args.push(t.escapeBashCharacters('due:'+taskInfo.dueDate))
        if(taskInfo.recurr.length>0) {
            switch(taskInfo.recurr) {
                case 'Daily':
                args.push('recur:daily')
                break
                case 'Weekly':
                args.push('recur:weekly')
                break
                case 'Monthly':
                args.push('recur:monthly')
                break
                case 'Annually':
                args.push('recur:yearly')
                break
                default:

            }
        }
    }

    if(taskInfo.waitDate.length==15) {
        args.push(t.escapeBashCharacters('wait:'+taskInfo.waitDate))
    }

    if(taskInfo.untilDate.length==15) {
        args.push(t.escapeBashCharacters('until:'+taskInfo.untilDate))
    }
    
    taskInfo.tags.forEach((tag)=>{
        if(tag.length>0) {
            args.push(t.escapeBashCharacters('+'+tag))
        }
    })

    t.terminal(spawntask(args), (stdout, stderr, code)=>{
        res.json({
            success: code==0,
            stdout: stdout,
            stderr: stderr
        })
        return
    })
})

/**
 * 
 * @param {Array} args Array of Strings to pass to TaskWarrior 
 * @param {String} stdin Any input to pass to TaskWarrior via stdin. Example: 'Yes\n' to answer a yes/no prompt.
 */
function spawntask(args, stdin) {
    console.log(chalk.blueBright('task '+args.join(' ')))
    if (process.platform == 'linux') {
        return spawn('task', args, { shell: true, env: { HOME: t.home } })
    } else {
        return spawn('task', args, { shell: true })
    }
}

/**
 * Returns Promise of Array of all tasks (Pending, Completed, Deleted, etc.) in Taskwarrior
 * @returns {Promise} Promise of array of all tasks in TaskWarrior
 */
function getTaskList() {
    return new Promise((resolve, reject) => {
        t.terminal(spawntask(['export']), (stdout, stderr, code)=>{
            try {
                let result = JSON.parse(stdout)
                resolve(result)
            } catch(err) {
                console.log(chalk.red('Error: '+err))
                reject(err)
            }
        })
    })
}

/**
 * @returns {Promise} Promise of all the tasks in TaskWarrior sorted into all and pending subcatogories.
 */
export function getAllTasks() {
    return new Promise((resolve, reject) => {
        getTaskList().then((list) => {
            let result={
                pending: mapPendingTasks(list),
                all: mapAllTasks(list)
            }
            resolve(result)
        })
    })
}

/**
 * 
 * @param {Number} num Number to have zeros added to the left side.
 * @param {Number} zeros Minimal length of the returned string. Extra spaces will be padded with zeros on the left side.
 * @returns {String} String of num with extra zeros padded to the left side.
 */
function padZero(num, zeros) {
    let str = String(num)
    while(str.length<zeros) {
        str = '0'+str
    }
    return str
}

/**
 * 
 * @param {Array} list Array of tasks
 * @returns {Array} Array of tasks only with their ddescriptions, status, end, and uuid remaining. 
 */
function mapAllTasks(list) {
    let result = list.map((task) => {
        let endDate = ''
        if(task.end) {
            let end = parseZuluTimeString(task.end);
            endDate=`${padZero(end.getFullYear(), 4)}-${padZero(end.getMonth()+1, 2)}-${padZero(end.getDay(), 2)}`
        }
        return {
            description: task.description,
            status: task.status,
            end: endDate,
            uuid: task.uuid
        }
    })
    return result
}

/**
 * 
 * @param {Array} list Array of tasks
 * @returns {Array} Array of tasks with only description, tags, due, urgency, uuid remaining
 */
function mapPendingTasks(list) {
    let pendingTasks = list.filter((task) => {
        return task.status=='pending'
    })
    let result = pendingTasks.map((task) => {
        let dueDate = task.due ? getDurationUntilZuluString(task.due).toRelativeString() : ''
        return {
            description: task.description,
            tags: task.tags ? task.tags.join(', ') : '',
            due: dueDate,
            urgency: task.urgency.toFixed(1),
            uuid: task.uuid
        }
    })
    return result
}

/**
 *  Returns Promise of object representing a single task with a specific UUID. Dates get formatted in human-readable strings.  
 * @param {String} uuid 
 * @returns {Object} Object of the task with the requested uuid
 */
export function getSpecificTask(uuid) {
    return new Promise((resolve, reject) => {
        getTaskList().then((list) => {
            let task = list.find((task) => {
                return task.uuid==uuid
            })
            if (task) {
                Object.entries(task).forEach((entry)=>{
                    let key = entry[0]
                    let value = entry[1]

                    if(key=='entry' || key=='start' || key=='end' || key=='due' || key=='until' || key=='wait' || key=='modified' || key=='scheduled') {
                        task[key]=parseZuluTimeString(value).toString()
                    }
                })

                resolve(task)
            } else {
                reject(new Error('The uuid specified does not exist.'))
            }
        })
    })
}

export default taskw