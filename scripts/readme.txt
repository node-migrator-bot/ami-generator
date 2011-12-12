each folder is a "script"
user-data.sh will be run on boot as root.
post.sh will be added to the end of the user-data.sh, **as well as subsequent children of this script (in subfolders)**
pre.sh will be added to the start of the user-data.sh, **as well as subsequent children of this script (in subfolders)**