import subprocess
from imutils.video import VideoStream
import argparse
import datetime
import imutils
import time
import cv2


def screen(command):
    command = ["xset", "-display", ":0.0", "dpms", "force", command]
    subprocess.run(command)

min_area = 2000
vs =  VideoStream(src=0).start()
time.sleep(2.0)
timeout = 30

last_movement = time.time()
firstFrame = None

# loop over the frames of the video
while True:
    # grab the current frame and initialize the occupied/unoccupied
    # text
    frame = vs.read()

    # if the frame could not be grabbed, then we have reached the end
    # of the video
    if frame is None:
        break
    # resize the frame, convert it to grayscale, and blur it
    frame = imutils.resize(frame, width=500)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (21, 21), 0)
    # if the first frame is None, initialize it
    if firstFrame is None:
        firstFrame = gray
        continue

    # compute the absolute difference between the current frame and
    # first frame
    frameDelta = cv2.absdiff(firstFrame, gray)
    thresh = cv2.threshold(frameDelta, 25, 255, cv2.THRESH_BINARY)[1]
    # dilate the thresholded image to fill in holes, then find contours
    # on thresholded image
    thresh = cv2.dilate(thresh, None, iterations=2)
    cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL,
                            cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    movement = False
    # loop over the contours
    for c in cnts:
        # if the contour is too small, ignore it
        if cv2.contourArea(c) < min_area:
            continue
        movement = True
        break

    if movement:
        screen("on")
        last_movement = time.time()
    else:
        if (time.time() - last_movement) > timeout:
            screen("off")
    firstFrame = gray

    time.sleep(0.1)
