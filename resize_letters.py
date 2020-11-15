import os
import re

source_dir = './letterssrc'
dest_dir = './letters'
for filename in os.listdir(source_dir):
    print(filename)
    file = open(os.path.join(source_dir, filename))
    toWrite = ""
    for line in file:
        trans = re.search('^\s*transform="translate\((-?\d*\.\d*),\s?(-?\d*\.\d*)\)', line)
        path = re.search('^\s*d="', line)
        if (trans):
            toWrite += f"    transform=\"translate({float(trans.group(1)) * 2.5},{float(trans.group(2)) * 2.5})\">\n"
        elif (path):
            line = line.replace(",", " ")
            arr = line.split()
            toWrite += "\t\t"
            for part in arr:
                try:
                    part = float(part) * 2.5
                except ValueError:
                    pass
                toWrite += str(part) + " "
            toWrite += "\n"
        else:
            toWrite += line
    file.close()
    file = open(os.path.join(dest_dir, filename), "w")
    file.write(toWrite)
    file.close()
