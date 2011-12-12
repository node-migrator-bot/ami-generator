
apt-get install -y  apache2-utils gnuplot-nox

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
