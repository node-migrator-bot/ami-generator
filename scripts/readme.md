Each folder contains a set of scripts that are run when the folder is included in the configuration.  There are 3 types of script, differing by how often and when they are run during the AMI generation process.  All scripts are run as `root`.

* `user-data.sh` will be run once when the folder is used.
* `post.sh` will be added to the end of the user-data.sh, **as well as subsequent children of this script (in subfolders)**.  
* `pre.sh` will be added to the start of the user-data.sh, **as well as subsequent children of this script (in subfolders)**

Except for the *first* `pre.sh` script, it is not neceesary to include the `#!/bin/bash` directive at the top of the script file.

Scripts run as root, with `HOME="/home/root"`.  All commands and their output are logged to `/var/log/user-data.log` on the generated image. 