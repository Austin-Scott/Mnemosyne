/**
 * This is where Evan has to do his job
 * 1. create an enpoint to start and stop timers
 * 2. enable specifying tasks
 * 3. enpoint to retrieve previous timers (timew export) for JSON
 */

 import express from 'express'
 import fs from 'fs'
 import path from 'path'
 // TODO: learn what these two do (get some doxygen comments)
 import { spawn } from 'child_process'
 import terminal from '../terminal'

 const timeWarror = new express.Router()

 /**
  * https://taskwarrior.org/docs/timewarrior/tutorial.html 
  * commands that I (may) want to play with:
  * timew start <tag> <tag> <tags are a list>
  * timew stop
  * timew summary
  * timew continue
  * timew tags
  * timew track <start time (am/pm)> - <end time (am/pm)>
  *   track is a particularly tricky case, will require 
  *   complex logic to work properly
  * changing previous tasks details is extremely complicated,
  * use the link above to determine what I want to do with that.
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