#!/bin/bash
rm -f bundle.zip && webpack && zip bundle.zip index.html main.css bundle.js res/*
