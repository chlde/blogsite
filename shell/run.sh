#!/bin/bash
cd /home/web/myblog/blogsite
git pull
bower install
npm install
gulp build
