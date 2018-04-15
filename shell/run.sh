#!/bin/bash
cd ${BLOG_HOME}
git pull
bower install
npm install
gulp build
