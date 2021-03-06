# Mnemosyne
![Interface screens](https://user-images.githubusercontent.com/12504656/54495941-1f214580-48b7-11e9-8524-b0cfac0b89df.png)

Mnemosyne *(pronounced: "new-ma-se-nee")* is a graphical front-end for [jrnl](http://jrnl.sh/) built with [node.js](https://nodejs.org/en/) and [Bootstrap](https://getbootstrap.com/). jrnl is a fantastic open source text-based journaling application. However, it has one major problem: Interacting with your journal from a mobile device is difficult and error prone. This application seeks to fix that. By hosting a small node.js webserver on a device such as a Raspberry Pi, one can easily create and view their jrnl entries from a progressive web app on their phone or tablet anywhere. Mnemosyne is named after the Goddess of memory and remembrance in Greek mythology. 
## Getting Started
### For Raspberry Pi
First, download and install python, nodejs, openssl, git, and jrnl.
Before continuing, make sure you can add entries to the default journal by running:
~~~
jrnl This is my first entry!
~~~
If you see "[entry added to the default journal]" you are ready to proceed!
Next, clone down this repository by running:
~~~
git clone https://github.com/Austin-Scott/jrnl-Web-Interface.git
~~~
Change directory into the newly created folder, make the setup.sh script executable, then run it:
~~~
cd jrnl-Web-Interface/
chmod +x setup.sh
./setup.sh
~~~
Follow the on screen prompts to configure your server's self-signed https certificates. You will also be prompted to set a username and password. You will need these to access the application so don't forget them.
Finally start the server by running:
~~~
sudo node main.js
~~~
You can now interface with your journal by going to "https://localhost" or by entering your Raspberry Pi's ip address into any web browser. *Make sure you use https and not http!*
## Design Overview
![jrnl-interface-MVC](https://user-images.githubusercontent.com/12504656/54613184-49464500-4a28-11e9-9878-dbd427ff0d93.png)

Instead of using a cloud storage service such as Google Drive to synchronize multiple copies of your journal across devices this application simplifies the process by centralizing journal.txt to one copy on the server. The client then interacts with this file indirectly via AJAX calls. Since there is only one copy of your journal, you will always have the latest version and you will not have to worry about Google Drive creating merge conflicts if your file ever fails to sync.

## Planned Features
There is a major update currently being worked on in the development branch. This update will add support for Taskwarrior and Timewarrior as well as improvements to the jrnl interface. Mnemosyne is now aiming to be productivity and time management suite. 
