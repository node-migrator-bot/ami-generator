cat >> /home/$MY_USER/readme.txt <<EOF

Using Apache-Bench benchmarking
========================================

An example test is:
$ ab -n 8000 -c 100 http://example.com:8000/

This will output directly to the console (8000 requests with a concurrency of 100).  To output to a file suitable for plotting, use:

$ ab -n 8000 -c 100 -g out.dat http://example.com:8000/

After you have an output file, you can easily create a plot image.  A file 'plot.p' has been created to assist you in doing so.

You can edit plot.p to set your own details, but it will work out of the box without changes.  The command to run the plot is:

$ gnuplot plot.p

...which will create an output file named out.png.


EOF

