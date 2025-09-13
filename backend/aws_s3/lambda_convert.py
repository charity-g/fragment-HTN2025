# mp4
# import ffmpeg

# input_path = "./2025-02-09 20-58-31.webm"
# output_path = "output.mp4"

# ffmpeg.input(input_path).output(output_path, vcodec='libx264').run()

# moviepy

from moviepy.editor import VideoFileClip
import boto3
import os

# READING FROM LOCAL FUNCTIONS
def webm_to_mp4(input_path: str, output_path: str):
    clip = VideoFileClip(input_path)
    clip.write_videofile(output_path, codec="libx264")

def webm_to_gif(input_path: str, output_path: str):
    clip = VideoFileClip(input_path)
    clip.write_gif(output_path)

