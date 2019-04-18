import express from 'express'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

import t from '../terminal'
import { getDurationUntilZuluString, parseZuluTimeString } from '../dates'

const taskw = new express.Router()

function modifyTask(uuid, command) {
    return new Promise((resolve, reject)=>{
        t.terminal(spawntask(command='delete'?['delete', uuid]:[uuid, command]), (stdout, stderr, code)=>{
            resolve({
                success: code==0,
                stdout: stdout,
                stderr: stderr
            })
        })
    })
}

taskw.post('/modify', (req, res)=>{
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
    }

})

taskw.post('/create', (req, res)=>{
    let taskInfo = req.body
    if(taskInfo.desc===undefined) {
        res.json({
            success: false,
            stdout: '',
            stderr: 'Error: desc must be set'
        })
        return
    }
    let args = ['create', taskInfo.desc]
    t.terminal(spawntask(args), (stdout, stderr, code)=>{
        res.json({
            success: code==0,
            stdout: stdout,
            stderr: stderr
        })
        return
    })
})

function spawntask(args, stdin) {
    if (process.platform == 'linux') {
        return spawn('task', args, { shell: true, env: { HOME: t.home } })
    } else {
        return spawn('task', args, { shell: true })
    }
}

/**
 * Returns Promise of Array of all tasks (Pending, Completed, Deleted, etc.) in Taskwarrior
 */
function getTaskList() {
    return new Promise((resolve, reject) => {
        t.terminal(spawntask(['export']), (stdout, stderr, code)=>{
            let result = JSON.parse(stdout)
            resolve(result)
        })
    })
}

/**
 * Returns Promise of Array of pending tasks formated for use in the pending tasks table
 */
export function getPendingTasks() {
    return new Promise((resolve, reject) => {
        getTaskList().then((list) => {
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
            resolve(result)
        })
    })
}

/**
 *  Returns Promise of object representing a single task with a specific UUID. Dates get formatted in human-readable strings.  
 * @param {String} uuid 
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