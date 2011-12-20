apt-get install -y apache2-utils gnuplot-nox

cat > /home/$MY_USER/plot.p <<EOF
# output as png image
set terminal png

# save file to "out.png"
set output "out.png"

# graph title
set title "ab -n 8000 -c 100"

# nicer aspect ratio for image size
set size 1,0.7

# y-axis grid
set grid y

# x-axis label
set xlabel "request"

# y-axis label
set ylabel "response time (ms)"

# plot data from "out.dat" using column 9 with smooth sbezier lines
# and title of "Series A" for the given data
plot "out.dat" using 9 smooth sbezier with lines title "Series A"

EOF

chmod 666 /home/$MY_USER/plot.p

cat >> /home/$MY_USER/readme.txt <<EOF

Using Apache-Bench benchmarking
================================

An example test is:
$ ab -n 8000 -c 100 http://example.com:8000/

This will output directly to the console (8000 requests with a concurrency of 100).  To output to a file suitable for plotting, use:

$ ab -n 8000 -c 100 -g out.dat http://example.com:8000/

After you have an output file, you can easily create a plot image.  A file 'plot.p' has been created to assist you in doing so.

You can edit plot.p to set your own details, but it will work out of the box without changes.  The command to run the plot is:

$ gnuplot plot.p

...which will create an output file named out.png.


EOF

