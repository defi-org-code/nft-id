const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = async (name, handle, image) => {
  console.log(name, handle, image);
  image = image.replace('./', '');
  console.log(image);
  name = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  name = name.replace("'", '');
  await exec(
    `convert -size 400x400 xc:none -draw "roundrectangle 0,0,400,400,20,20" png:- | convert /Users/rotemyakir/Workspace/Orbs/nft-id/${image} -matte - -compose DstIn -composite dst.png && convert empty-certificate.png \
       \\( -page +102+102 dst.png -resize 720x720! \\) -page +112+112 rectangle.png -page +590+10 stamp.png -layers Flatten -gravity center \\( -pointsize 40 -fill white -font Ubuntu-Bold.ttf -annotate +475-280 '${name}' \\) \
        \\( -pointsize 28 -fill "rgba(255,255,255,0.8)" -font Ubuntu-Regular.ttf -annotate +475-220 '@${handle}' \\) \
         \\( -pointsize 32 -fill white -font Ubuntu-Regular.ttf -annotate +262+320 '19th September 2021' \\) -background None -layers Flatten certificates/${handle}.png`
  );

  console.log("Finished", handle);
};

