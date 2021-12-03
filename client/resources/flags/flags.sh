#! /bin/bash

input="../codes.txt"

while IFS= read -r line
do
  fl="../../node_modules/language-icons/icons/$line.svg"
  if [ -f $fl ]
  then
    cp $fl .
  fi
done < "$input"