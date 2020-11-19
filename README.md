# 3D Ambigram Generator

https://2catteam.github.io/AmbigramGenerator/

This is a fun tool I developed for developing 3D ambigrams from arbitrary words or phrases.

An ambigram is [a calligraphic design that has several interpretations as written](https://en.wikipedia.org/wiki/Ambigram). In simpler terms, it's a design in which the meaning changes depending on perspective.

While traditionally ambigrams are 2D, I've always found that 3D ambigrams are just as awesome, if not moreso [(And apparently lots of people agree with me)](https://www.reddit.com/r/3Dprinting/comments/aqogml/i_too_3d_printed_a_gift_for_my_girlfriend_for/). In addition, 3D ambigrams are incredibly easy to create, requiring nothing more than a simple series of intersect operations for the simplest models like that link shows.

This generator aims to add just one more layer of complexity to that idea. Rather than directly matching letters together in order, it instead splits the letters into parts, then randomly pairs each part up. The advantage of this over the one-to-one approach is twofold; first, I personally think it looks cooler. Second, and more importantly, it lets you create models where the two profiles don't match in length, which is something the one-to-one approach can't really do without adding other profiles. In my opinion, the result is really cool! Though, obviously, I am super biased, as the creator of the generator. Hopefully you agree! And hopefully you find this tool useful and cool!

Personally, I've found these make great gifts for friends. You can do their first and last name, or for a couple, both of their names, or a person's name and a nice word... Just generate a file, send it to the printer, and your friend thinks you put, like, time and effort into making a custom gift just for them, when in reality, you just had extra time while you were waiting for your TV dinner to finish in the microwave. If you want to put slightly more effort into it, I've found that it looks great to spray-paint your models on one side, so the two profiles stand apart from each other a little more. Just hold it at arm's length, and give it a light, light coat. I've also enjoyed putting them on rotating bases, so that you can see both words without having to move the model yourself.

## Potential questions

#### What does the tool say some words are "too complex"?

Each character has a pre-programmed score, as shown in the table below:

| Characters | Score |
| ---------- | ----- |
| Space | 0 |
| C, G, J, L, S, Z | 1 |
| A, D, F, H, I, K, M, O, P, Q, T, U, V, X, Y | 2 |
| B, E, N, R, W | 3 |

So, the word "Default" has a score of 14. That means that the tool wants the word "Default" to be broken up into 14 different parts - 2 for the D, 3 for the E, 2 for the F, etc.

The tool will calculate the score of each of the words, then, if they don't match, it will reduce the score of the more complex word until they do. First, it will reduce the score of the 3-score letters by one. Then, it will reduce the score of all of the 2-score letters by one. If the letters still don't match, it will issue a warning, because reducing a face any further would make the resulting model look pretty lame on that face, IMO. It will then, if the user confirms it, reduce the score of the 3-score words by one again. If this was still not enough to make the word scores match, it will start duplicating letters, because at this point there is no other solution for matching the letters together. This should only be the case when the two words differ in length by a factor of 2 or 3.

#### Why do the letters not line up the same when I print the file I downloaded?

The tool uses an orthographic camera when displaying the files, rather than a perspective-based one. This means that, the further you are from your model, the closer your model will look to what the tool shows. In my experience, most models look fine from an arm's length away or more. This works fine if you put it on a shelf or something.

If you want to make your model easier to see from close-up, you can generate a file without a base, print the loose letters, and then glue them down on a flat sheet of wood or plastic or something, making adjustments as needed to make sure it shows up right from the distance you want it to.

#### What are the limitations of this software?

As noted above, it cannot generate for a particular perspective. It also currently only supports letters and spaces. I may add number support later if someone asks for it, IDK. The SVG files (which implement each new character) are kinda the hardest part.

#### Why doesn't this tool support \<feature\>?

Primarily because I slapped this together in a weekend for fun. If you have something you want me to add, though, please let me know and I'll look into it! Better yet, if you want to add the feature yourself, I'm always open to pull requests!

There are probably more questions you may ask, but I can't think of any more right now, so as they get asked, I'll update this page with answers to them.

## Libraries used

Generating and manipulating 3D geometry is a hard task at the best of times, and I couldn't have done it without the following libraries:

[Three.js](https://threejs.org/) - The core library that the project is built on.

[Three-CSGMesh](https://github.com/manthrax/THREE-CSGMesh) - Super underappreciated library that implemented the intersect operations that made this tool possible.

[JQuery](https://jquery.com/) - because everything needs JQuery

[Gif.js](https://github.com/jnordberg/gif.js) - Lets me render the gifs for sharing

[FileSaver.js](https://github.com/eligrey/FileSaver.js/) - Allows for downloading the files

[Seedrandom.js](https://github.com/davidbau/seedrandom) - Allows files to be generated consistently. This is important because, if you print each letter individually and don't have access to the original file, it can be pretty tricky trying to guess where the pieces go (I've had this happen to me multiple times when I used a similar generator I made in VBA for Autodesk Inventor).
