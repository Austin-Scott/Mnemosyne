import express from 'express'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

import t from '../terminal'
import { getDurationUntilZuluString } from '../dates'

const taskw = new express.Router()

function spawntask(args) {
    if (process.platform == 'linux') {
        return spawn('task', args, { shell: true, env: { HOME: t.home } })
    } else {
        return spawn('task', args, { shell: true })
    }
}

let testJSON = 
`[
{"id":1,"description":"Test task","entry":"20190211T154011Z","modified":"20190211T154011Z","status":"pending","uuid":"be1cd61e-c8c3-4907-a0d4-d2e13462d2da","urgency":0.350685},
{"id":2,"description":"test 2","entry":"20190416T132135Z","modified":"20190416T132135Z","status":"pending","uuid":"7349b28c-9f34-49bb-930f-ad2db3c4d024","urgency":0},
{"id":3,"description":"test 3","entry":"20190416T132139Z","modified":"20190416T132139Z","status":"pending","uuid":"9cd8d13f-fce7-4b29-870b-fe0bdef067ee","urgency":0},
{"id":4,"description":"test 4","due":"20190510T050000Z","entry":"20190416T132155Z","modified":"20190416T132155Z","status":"pending","uuid":"ba6d6baf-946f-4f46-b9a3-38a303237092","urgency":2.4},
{"id":5,"description":"test 5","entry":"20190416T132201Z","modified":"20190416T132201Z","status":"pending","uuid":"eb530e23-8035-465d-8c5c-fdce887a5fa4","urgency":0},
{"id":6,"description":"test 6","entry":"20190416T132214Z","modified":"20190416T132214Z","status":"pending","uuid":"2f99180b-f308-46e1-9da9-aecfe4be4c9f","urgency":0},
{"id":7,"description":"test 7","entry":"20190416T132219Z","modified":"20190416T132219Z","status":"pending","uuid":"3952f84f-b6b1-4742-87d3-25501996db79","urgency":0},
{"id":8,"description":"test 8","entry":"20190416T132224Z","modified":"20190416T132224Z","status":"pending","uuid":"bf3b508f-2117-4bd6-9f8d-00fd0cbc8edc","urgency":0},
{"id":9,"description":"test 9","entry":"20190416T132239Z","modified":"20190416T132410Z","status":"pending","uuid":"9771fd3e-ede0-4559-a21f-383e9be6e412","urgency":0},
{"id":10,"description":"test 10","entry":"20190416T132420Z","modified":"20190416T132420Z","status":"pending","uuid":"12a94f89-47b7-4f65-8cf8-c0455e25e9b0","urgency":0},
{"id":11,"description":"More tasks 1","entry":"20190416T144409Z","modified":"20190416T144409Z","status":"pending","uuid":"f247b1d5-a86f-4b4c-8229-f2747913404d","urgency":0},
{"id":12,"description":"More tasks 2","entry":"20190416T144414Z","modified":"20190416T144414Z","status":"pending","uuid":"83a909ce-48c4-41ff-86ee-af896d31f9b4","urgency":0},
{"id":13,"description":"More tasks 3","entry":"20190416T144419Z","modified":"20190416T144419Z","status":"pending","uuid":"6a8a327c-4aff-4e84-a193-11f885718561","urgency":0},
{"id":14,"description":"More tasks 4","entry":"20190416T144423Z","modified":"20190416T144423Z","status":"pending","uuid":"c5a45e09-7d81-4164-b494-4faa262220f6","urgency":0},
{"id":15,"description":"More tasks 5","entry":"20190416T144430Z","modified":"20190416T144430Z","status":"pending","uuid":"48e65b0a-4f9d-4cc5-8ef7-c58ef769f6aa","urgency":0},
{"id":16,"description":"More tasks 6","entry":"20190416T144436Z","modified":"20190416T144436Z","status":"pending","uuid":"dcc10096-6d76-4669-a49b-664e89c94577","urgency":0},
{"id":17,"description":"More tasks 7","entry":"20190416T144440Z","modified":"20190416T144440Z","status":"pending","uuid":"7bf25dc4-8edf-4674-bf83-a74dfe29694d","urgency":0},
{"id":18,"description":"More tasks 8","entry":"20190416T144448Z","modified":"20190416T144448Z","status":"pending","uuid":"e8666fc3-48bf-4f8f-a715-c3899d322b93","urgency":0},
{"id":19,"description":"More taks 9","entry":"20190416T144454Z","modified":"20190416T144454Z","status":"pending","uuid":"67435f59-3fd0-4c8a-9cfd-48314c09cb1f","urgency":0},
{"id":20,"description":"More tasks 10","entry":"20190416T144500Z","modified":"20190416T144500Z","status":"pending","uuid":"468d4f65-3fac-4f0d-b18c-6ac55f646f3f","urgency":0},
{"id":21,"description":"Task with some tags","entry":"20190416T145911Z","modified":"20190416T145911Z","status":"pending","tags":["tag"],"uuid":"cbac3048-c838-4ac3-adec-4757c8d35b58","urgency":0.8},
{"id":22,"description":"Task with some tags 2","entry":"20190416T145921Z","modified":"20190416T145921Z","status":"pending","tags":["tag"],"uuid":"56d9b100-a321-45cf-b4ad-77859c623829","urgency":0.8},
{"id":23,"description":"Task with some tags 3","entry":"20190416T145937Z","modified":"20190416T145937Z","status":"pending","tags":["tag","someOtherTag"],"uuid":"7791276c-3b47-45f3-8534-0220f2b6001e","urgency":0.9},
{"id":24,"description":"Task with some tags 4","entry":"20190416T145951Z","modified":"20190416T145951Z","status":"pending","tags":["tag","someOtherTag"],"uuid":"dd09a595-5b54-48a5-ae45-d28fa74a5382","urgency":0.9},
{"id":25,"description":"Task with some tags 5","entry":"20190416T150011Z","modified":"20190416T150011Z","status":"pending","tags":["tag","someOtherTag","someOtherCrazyTag"],"uuid":"b3ce9b1f-f3d1-485f-9027-e89fc90e5f57","urgency":1},
{"id":26,"description":"task due soon","due":"20190425T050000Z","entry":"20190416T181125Z","modified":"20190416T181125Z","status":"pending","uuid":"37800d46-53c2-41a9-82a6-921be4ae20a2","urgency":4.93715},
{"id":27,"description":"task due later","due":"20190430T050000Z","entry":"20190416T181149Z","modified":"20190416T181149Z","status":"pending","uuid":"7f26d656-29f0-4778-bc62-bdc5bbe49a0d","urgency":2.65143},
{"id":0,"description":"test 14","end":"20190416T133032Z","entry":"20190416T132929Z","modified":"20190416T133033Z","status":"deleted","uuid":"464a20bd-2cc3-4f61-aab7-092f2e86f2d1","urgency":0},
{"id":0,"description":"test 15","end":"20190416T133033Z","entry":"20190416T132933Z","modified":"20190416T133033Z","status":"deleted","uuid":"ef7b7f03-c3b3-4ab3-bc82-a3fb0ec35bab","urgency":0},
{"id":0,"description":"test 16","end":"20190416T133033Z","entry":"20190416T132937Z","modified":"20190416T133033Z","status":"deleted","uuid":"73e0d982-477b-4c92-8ddd-55254cd19cac","urgency":0},
{"id":0,"description":"test 11","end":"20190416T133013Z","entry":"20190416T132918Z","modified":"20190416T133018Z","status":"completed","uuid":"9c4bb0b8-405d-4dfa-82f9-4b4291b50767","urgency":0},
{"id":0,"description":"test 12","end":"20190416T133018Z","entry":"20190416T132922Z","modified":"20190416T133018Z","status":"completed","uuid":"d616e008-f206-4822-9095-4ed72f6ba52c","urgency":0},
{"id":0,"description":"test 13","end":"20190416T133018Z","entry":"20190416T132925Z","modified":"20190416T133018Z","status":"completed","uuid":"7b739c66-8c86-49ea-a197-2d123eb72341","urgency":0}
]`

function getTaskList() {
    return new Promise((resolve, reject) => {
        /*
        t.terminal(spawntask(['export']), (stdout, stderr, code)=>{
            let result = JSON.parse(stdout)
            resolve(result)
        })
        */
        resolve(JSON.parse(testJSON))
    })
}

export function getPendingTasks() {
    return new Promise((resolve, reject) => {
        getTaskList().then((list) => {
            let pendingTasks = list.filter((task) => {
                return task.status=='pending'
            })
            let result = pendingTasks.map((task) => {
                let dueDate = task.due ? getDurationUntilZuluString(task.due).toString() : ''
                let creationDate = task.entry ? getDurationUntilZuluString(task.entry).toString() : ''
                return {
                    description: task.description,
                    created: creationDate,
                    tags: task.tags ? task.tags.join(', ') : '',
                    due: dueDate,
                    urgency: task.urgency,
                    uuid: task.uuid
                }
            })
            resolve(result)
        })
    })
}

export function getSpecificTask(uuid) {
    return new Promise((resolve, reject) => {
        getTaskList().then((list) => {
            let task = list.find((task) => {
                return task.uuid==uuid
            })
            if (task) {
                resolve(task)
            } else {
                reject(new Error('The uuid specified does not exist.'))
            }
        })
    })
}

export default taskw