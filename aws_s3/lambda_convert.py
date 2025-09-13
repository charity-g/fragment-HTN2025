# mp4
import ffmpeg

input_path = "./2025-02-09 20-58-31.webm"
output_path = "output.mp4"

ffmpeg.input(input_path).output(output_path, vcodec='libx264').run()

# optional 
# from moviepy.editor import VideoFileClip

# input_path = "input.webm"
# output_path = "output.mp4"

# clip = VideoFileClip(input_path)
# clip.write_videofile(output_path, codec="libx264")
