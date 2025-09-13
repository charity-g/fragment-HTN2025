# mp4
# import ffmpeg

# input_path = "./2025-02-09 20-58-31.webm"
# output_path = "output.mp4"

# ffmpeg.input(input_path).output(output_path, vcodec='libx264').run()

# moviepy

from moviepy.editor import VideoFileClip

input_path = "2025-02-09 20-58-31.webm"
output_path = "output.mp4"

clip = VideoFileClip(input_path)
clip.write_videofile(output_path, codec="libx264")

from moviepy.editor import VideoFileClip

# Load your WebM video
clip = VideoFileClip("2025-02-09 20-58-31.webm")

# Export as GIF
clip.write_gif("output.gif")