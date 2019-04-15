import express from 'express'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

import t from '../terminal.js'

const taskw = new express.Router()

function spawntask(args) {
    if (process.platform == 'linux') {
        return spawn('task', args, { shell: true, env: { HOME: t.home } })
    } else {
        return spawn('task', args, { shell: true })
    }
}

export function getTaskList() {
    return new Promise((resolve, reject)=>{
        t.terminal(spawntask(['export']), (stdout, stderr, code)=>{
            let result = JSON.parse(stdout)
            resolve(result)
        })
    })
}

export default taskw