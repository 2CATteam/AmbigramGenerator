toChange = input("Paste SVG data\n")

arr = toChange.split()

commands = ["M", "V", "H", "L", "C", "Q", "Z"]
commandStack = []
positionStack = []

toAdd = []

while len(arr) > 0:
    data = arr[0]
    if (data in commands):
        toAdd = {"command": data}
        if data == "M":
            positionStack.append((float(arr[1]), float(arr[2])))
            del arr[2]
            del arr[1]
        elif data == "V":
            positionStack.append((positionStack[-1][0], float(arr[1])))
            del arr[1]
        elif data == "H":
            positionStack.append((float(arr[1]), positionStack[-1][1]))
            del arr[1]
        elif data == "L":
            positionStack.append((float(arr[1]), float(arr[2])))
            del arr[2]
            del arr[1]
        elif data == "C":
            toAdd["x1"] = float(arr[1])
            toAdd["y1"] = float(arr[2])
            toAdd["x2"] = float(arr[3])
            toAdd["y2"] = float(arr[4])
            positionStack.append((float(arr[5]), float(arr[6])))
            for i in range(6):
                del arr[1]
        elif data == "Q":
            toAdd["x1"] = float(arr[1])
            toAdd["y1"] = float(arr[2])
            positionStack.append((float(arr[3]), float(arr[4])))
            for i in range(4):
                del arr[1]
        elif data == "Z":
            positionStack.append((0, 0))
        commandStack.append(toAdd)
    else:
        print("Unrecognized command", data)
    del arr[0]

toPrint = ""

while len(commandStack) > 0:
    command = commandStack[-1]
    if command["command"] == "Z":
        del positionStack[-1]
        toPrint += f"M {positionStack[-1][0]} {positionStack[-1][1]} "
        del commandStack[-1]
        del positionStack[-1]
    elif command["command"] == "M":
        toPrint += "Z "
        del commandStack[-1]
    elif command["command"] == "V":
        toPrint += f"V {positionStack[-1][1]} "
        del commandStack[-1]
        del positionStack[-1]
    elif command["command"] == "H":
        toPrint += f"H {positionStack[-1][0]} "
        del commandStack[-1]
        del positionStack[-1]
    elif command["command"] == "L":
        toPrint += f"L {positionStack[-1][0]} {positionStack[-1][1]} "
        del commandStack[-1]
        del positionStack[-1]
    elif command["command"] == "C":
        toPrint += f"C {command['x2']} {command['y2']} {command['x1']} {command['y1']} {positionStack[-1][0]} {positionStack[-1][1]} "
        del commandStack[-1]
        del positionStack[-1]
    elif command["command"] == "Q":
        toPrint += f"Q {command['x1']} {command['y1']} {positionStack[-1][0]} {positionStack[-1][1]} "
        del commandStack[-1]
        del positionStack[-1]

toPrint = toPrint[:-1]

print(toPrint)
