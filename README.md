# 3D Ambigram Generator

https://2catteam.github.io/AmbigramGenerator/

This is a fun tool I developed for developing 3D ambigrams from arbitrary words or phrases.

An ambigram is [a calligraphic design that has several interpretations as written](https://en.wikipedia.org/wiki/Ambigram). In simpler terms, it's a design in which the meaning changes depending on perspective.

While traditionally ambigrams are 2D, I've always found that 3D ambigrams are just as awesome, if not moreso [(And apparently lots of people agree with me)](https://www.reddit.com/r/3Dprinting/comments/aqogml/i_too_3d_printed_a_gift_for_my_girlfriend_for/). In addition, 3D ambigrams are incredibly easy to create, requiring nothing more than a simple intersect operation for the simplest models like that link shows.

This generator aims to add just one more layer of complexity to that idea. I've always preferred ambigrams where the model looks meaningless until you notice the right angle to look at it from, so this generator splits the components into parts, then randomly pairs the parts up. In my opinion, the result is pretty cool! Though, obviously, I am super biased, as the creator of the generator. Hopefully you agree! And hopefully you find this tool useful and cool!

## Potential questions

#### Why do the letters not line up the same when I print the file I downloaded?

The tool uses an orthographic camera when displaying the files, rather than a perspective-based one. This means that, the further you are from your model, the closer your model will look to what the tool shows. In my experience, most models look fine from an arm's length away or more. 

#### What are the limitations of this software?

As noted above, it cannot generate for a particular perspective. It also currently only supports letters and spaces. I may add number support later if someone asks for it, IDK. The SVG files are kinda the hardest part.

#### Why doesn't this tool support <feature>?

Primarily because I slapped this together in a weekend for fun. If you have something you want me to add, though, please let me know and I'll look into it! Better yet, if you want to add the feature yourself, I'm always open to pull requests!

There are probably more questions you may ask, but I can't think of any more right now, so as they get asked, I'll update this page with answers to them.

## Libraries used

Generating and manipulating 3D geometry is a hard task at the best of times, and I couldn't have done it without the following libraries:

[Three.js](https://threejs.org/) - The core library that the project is built on.

[Three-CSGMesh](https://github.com/manthrax/THREE-CSGMesh) - Super underappreciated library that implemented the intersect operations that made this tool possible.

[JQuery](https://jquery.com/) - because everything needs JQuery

[FileSaver.js](https://github.com/eligrey/FileSaver.js/) - Allows for downloading the files

[Seedrandom.js](https://github.com/davidbau/seedrandom) - Allows files to be generated consistently. This is important because, if you print each letter individually and don't have access to the original file, it can be pretty tricky trying to guess where the pieces go (I've had this happen to me multiple times when I used a similar generator I made in VBA for Autodesk Inventor).
