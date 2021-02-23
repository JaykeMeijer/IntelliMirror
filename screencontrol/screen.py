import subprocess
from imutils.video import VideoStream
import datetime
import imutils
import time
import cv2
import sys


min_area = 2000
timeout = 60
interval = 1


def screen(command):
    """
    Set the screen state.

    :param command: State to switch to as string. Either "on" or "off"
    """
    command = ["xset", "-display", ":0.0", "dpms", "force", command]
    subprocess.run(command)


def process_frame(frame):
    """
    Resize the frame, convert it to grayscale, and blur it

    :param frame:   Input frame to process
    :returns:       Processed frame
    """
    frame = imutils.resize(frame, width=500)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (21, 21), 0)
    return gray


# Load video stream and wait for init
vs = VideoStream(src=0).start()
time.sleep(2.0)
frame = vs.read()
if frame is None:
    sys.exit("Failed to get camera feed")

# Initialize state
last_movement = time.time()
baseFrame = process_frame(frame)

# loop over the frames of the video
while True:
    # grab the current frame
    frame = vs.read()

    # if the frame could not be grabbed, try again
    if frame is None:
        continue

    gray = process_frame(frame)

    # Compute the absolute difference between the current frame and
    # base frame
    frameDelta = cv2.absdiff(baseFrame, gray)
    thresh = cv2.threshold(frameDelta, 25, 255, cv2.THRESH_BINARY)[1]

    # dilate the thresholded image to fill in holes, then find contours
    # on thresholded image
    thresh = cv2.dilate(thresh, None, iterations=2)
    cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL,
                            cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    movement = False

    # loop over the contours until we find one big enough
    for c in cnts:
        # if the contour is too small, ignore it
        if cv2.contourArea(c) < min_area:
            continue
        else:
            movement = True
            break

    if movement:
        screen("on")
        last_movement = time.time()
    else:
        if (time.time() - last_movement) > timeout:
            screen("off")
    baseFrame = gray

    time.sleep(interval)

