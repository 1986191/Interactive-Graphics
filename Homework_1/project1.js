// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
    // Pixel sizes
    // If fgPos.x and fgPos.y are 0 do no adjustments
    var w = fgImg.width * 4;        // A pixel -> 4 consecutive values
    var h = fgImg.height;           // pixels distributed only horizontally, don't multiply by 4
    var bgw = bgImg.width * 4;      // background Image width in pixels
    var bgh = bgImg.height;         // background image height in pixels

    for (var i = 0; i < h; i++) 
    {
        for(var j = 0; j < w; j+=4)
        {
            // Foreground index map
            var fg_index = i * w + j;
            
            // Calculate the background 2D index
            var bg_x = fgPos.x * 4 + j;
            var bg_y = fgPos.y + i;
            var bg_index = bg_y * bgw + bg_x;

            // If the background index is outside of the background image bounds, skip it
            if (!(bg_x < 0 || bg_x >= bgw || bg_y < 0 || bg_y >= bgh)) 
            {
                if (bg_index < bgImg.data.length) 
                {   
                    // Get foreground pixel data (RGB and Alpha values)
                    var rf = fgImg.data[fg_index + 0]; // R
                    var gf = fgImg.data[fg_index + 1]; // G
                    var bf = fgImg.data[fg_index + 2]; // B
                    var af = (fgImg.data[fg_index + 3] / 255) * fgOpac; // Normalize then multiply by fg opacity

                    // Get the corresponding background pixel data
                    var rb = bgImg.data[bg_index + 0];
                    var gb = bgImg.data[bg_index + 1];
                    var bb = bgImg.data[bg_index + 2];
                    var ab = bgImg.data[bg_index + 3] / 255; // Useless value

                    // Interpolate colors using alpha
                    bgImg.data[bg_index + 0] = rf * af + (1 - af) * rb; // R
                    bgImg.data[bg_index + 1] = gf * af + (1 - af) * gb; // G
                    bgImg.data[bg_index + 2] = bf * af + (1 - af) * bb; // B
                    // Don't change background alpha
                }
            }
        }
    }
}
