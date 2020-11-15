toChange = input("Paste SVG data\n")

arr = toChange.split()

stack = []

commands = ["M", "V", "H", "C", "L", "Q"]

toAdd = []

toPrint = ""

tempx = 0
tempy = 0

for data in arr:
    if (data in commands):
        stack.append(toAdd)
        toAdd = [data]
    elif (data == "Z"):
        stack = stack [::-1]
        while len(stack) > 0:
            adding = stack.pop(0)
            if len(adding) == 0:
                continue
            if (adding[0] == "C"):
                a, b = adding[1], adding[2]
                adding[1] = adding[3]
                adding[2] = adding[4]
                adding[3] = a
                adding[4] = b
                if (len(stack) > 0):
                    if (len(stack[0]) >= 7):
                        adding[5] = stack[0][5]
                        adding[6] = stack[0][6]
            if (adding[0] == "Q"):
                #a, b = adding[1], adding[2]
                #adding[1] = adding[3]
                #adding[2] = adding[4]
                #adding[3] = a
                #adding[4] = b
                if (len(stack) > 0 and len(stack[0]) >= 5):
                    adding[3] = stack[0][3]
                    adding[4] = stack[0][4]
            for item in adding:
                toPrint += str(item)
                toPrint += " "
        toPrint += "Z "
    else:
        toAdd.append(data)

print(toPrint)
