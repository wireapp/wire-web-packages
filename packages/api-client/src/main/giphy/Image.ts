interface Image {
  data: {
    type: string;
    id: string;
    url: string;
    image_original_url: string;
    image_url: string;
    image_mp4_url: string;
    image_frames: string;
    image_width: string;
    image_height: string;
    fixed_height_downsampled_url: string;
    fixed_height_downsampled_width: string;
    fixed_height_downsampled_height: string;
    fixed_width_downsampled_url: string;
    fixed_width_downsampled_width: string;
    fixed_width_downsampled_height: string;
    fixed_height_small_url: string;
    fixed_height_small_still_url: string;
    fixed_height_small_width: string;
    fixed_height_small_height: string;
    fixed_width_small_url: string;
    fixed_width_small_still_url: string;
    fixed_width_small_width: string;
    fixed_width_small_height: string;
    username: string;
    caption: string;
  };
  meta: {
    status: number;
    msg: string;
    response_id: string;
  };
}

export default Image;
