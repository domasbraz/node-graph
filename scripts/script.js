
window.onload = function()
{
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');

    function setCanvasSize()
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }


    var nodes = 
    [
        { x: 200, y: 50, radius: 50, color: 'blue', isDragging: false, z: 0, id: "r1", text: "Node"},
        { x: 200, y: 200, radius: 50, color: 'red', isDragging: false, z: 1, id: "r2", text: "Node"},
        { x: 350, y: 50, radius: 50, color: 'green', isDragging: false, z: 2, id: "r3", text: "Node"}
    ];

    var relations =
    [
        {from: "r2", to: "r1", name: "line", drawn: false},
        {from: "r1", to: "r2", name: "line", drawn: false},
        {from: "r3", to: "r3", name: "line", drawn: false, pos: "NaN"}
    ];

    var history = [];
    var historyIndex;

    var selected = [];
    var globalDrag = false;
    var startX, startY;

    var globalSizeModifier = 1;
    var maxZoomIn = 5;
    var maxZoomOut = 0.5;

    var active = [];
    var clipBoard = [];

    function checkIfExists(node)
    {
        let exists = false;
        for (let i = 0; i < selected.length; i++)
        {
            if (selected[i] == node)
            {
                exists = true;
            }
        } 

        return exists;
    }

    function addToSelected(node)
    {
        if (!checkIfExists(node))
        {
            selected.push(node);
        }
    }

    function resetSelected()
    {
        selected = [];
    }

    function getHighestZValue()
    {
        let highest = selected[0];

        for (let i = 1; i < selected.length; i++)
        {
            if (selected[i].z > highest.z)
            {
                highest = selected[i];
            }
        }

        return highest;
    }

    function setZValues()
    {
        let zValues = [];
        for (let i = 0; i < nodes.length; i++)
        {
            let node = nodes[i];

            while (existsInArray(zValues, node.z))
            {
                node.z++;
            }
            zValues.push(node.z);
        }
    }

    function sortNodes()
    {
        let isSorted = true;

        for (let i = 1; i < nodes.length; i++)
        {
            let node = nodes[i];
            let prevNode = nodes[i - 1];

            if (node.z < prevNode.z)
            {
                let temp = (JSON.stringify(node));

                node = JSON.parse(JSON.stringify(prevNode));
                prevNode = JSON.parse(temp);
                isSorted = false;
            }
        }
        if (isSorted)
        {
            return;
        }
        sortNodes();
    }

    function drawNodes()
    {
        nodes.forEach(function(node)
        {
            context.fillStyle = node.color;
            context.beginPath();
            context.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
            context.fill();

            context.font = `${150 * globalSizeModifier}% Arial`;
            context.fillStyle = 'black';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.strokeStyle = "white";
            context.lineWidth = 2 * globalSizeModifier;
            context.strokeText(node.text, node.x, node.y);
            context.fillText(node.text, node.x, node.y);
        });
    }

    function selectActiveNode(node)
    {
        active = [node.x, node.y, node.radius, 0, 2 * Math.PI, node.id];
    }

    function resetActiveNode()
    {
        active = [];
        updateCanvas();
    }

    function drawActive()
    {
        context.strokeStyle = "black";
        context.beginPath();
        context.arc(active[0], active[1], active[2], active[3], active[4]);
        context.stroke();
    }

    function drawSelfRelation(node)
    {
        let relation = getRelation(node.id, node.id);
        let posX = [node.x - node.radius, node.x + node.radius];
        let posY = [node.y - node.radius, node.y + node.radius];

        if (relation.pos == "NaN")
        {
            let x = Math.floor(Math.random() * 2);
            let y = Math.floor(Math.random() * 2);
            relation.pos = "" + x + y;
        }

        relation.x = posX[relation.pos.charAt(0)];
        relation.y = posY[relation.pos.charAt(1)]

        context.strokeStyle = "black";
        context.beginPath();
        context.arc(relation.x, relation.y, node.radius / 1.5, 0, 2 * Math.PI);
        context.stroke();

        context.font = `${150 * globalSizeModifier}% Arial`;
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.strokeStyle = "white";
        context.lineWidth = 2 * globalSizeModifier;
        context.strokeText(relation.name, relation.x, relation.y);
        context.fillText(relation.name, relation.x, relation.y);
    }

    function getRelation(from, to)
    {
        for (let i = 0; i < relations.length; i++)
        {
            let relation = relations[i];

            if (relation.from == from && relation.to == to)
            {
                return relation;
            }
        }
    }

    function getNode(id)
    {
        let result = undefined;

        for (let i = 0; i < nodes.length; i++)
        {
            let node = nodes[i];

            if (node.id == id)
            {
                result = node;
                break;
            }
        }

        return result;
    }

    function drawRelations()
    {
        for (let i = 0; i < relations.length; i++)
        {
            let relation = relations[i];

            if (relation.drawn)
            {
                continue;
            }
            if (relation.from == relation.to)
            {
                let node = getNode(relation.from);

                drawSelfRelation(node);
                relation.drawn = true;
                continue;
            }

            let opposite = get2WayRelation(relation);

            if (opposite != undefined)
            {
                drawArrow(relation, 3000 * globalSizeModifier);
                //drawArrow(opposite, -3000);
                continue;
            }

            drawArrow(relation);
        }
    }

    function get2WayRelation(relation)
    {
        let id1 = relation.from;
        let id2 = relation.to;

        for (let i = 0; i < relations.length; i++)
        {
            let relation2 = relations[i];

            if (relation2.from == id2 && relation2.to == id1)
            {
                return relation2;
            }
        }
    }

    function drawArrow(relation, yIntersection) 
    {
        let nodeA = getNode(relation.from);
        let nodeB = getNode(relation.to);
        let name = relation.name;

        if (nodeA.x == nodeB.x && nodeA.y == nodeB.y)
        {
            console.log("same position")
            return;
        }
        const nodePoints = findClosestPoints(nodeA, nodeB, yIntersection);


        if (nodePoints == undefined)
        {
            console.log("no points")
            return;
        }

        const pointAX = nodePoints[0][0];
        const pointAY = nodePoints[0][1];
        const pointBX = nodePoints[1][0];
        const pointBY = nodePoints[1][1];

        context.strokeStyle = 'black';
        context.lineWidth = 2 * globalSizeModifier;
        context.fillStyle = 'black';

        // Draw the line
        context.beginPath();
        context.moveTo(pointAX, pointAY);
        context.lineTo(pointBX, pointBY);
        context.stroke();
    
        // Draw the arrowhead
        const arrowSize = 10 * globalSizeModifier;
        const angle = Math.atan2(pointBY - pointAY, pointBX - pointAX);
        
        // Arrowhead points
        const arrowX1 = pointBX - arrowSize * Math.cos(angle - Math.PI / 6);
        const arrowY1 = pointBY - arrowSize * Math.sin(angle - Math.PI / 6);
        const arrowX2 = pointBX - arrowSize * Math.cos(angle + Math.PI / 6);
        const arrowY2 = pointBY - arrowSize * Math.sin(angle + Math.PI / 6);
    
        context.beginPath();
        context.moveTo(pointBX, pointBY);
        context.lineTo(arrowX1, arrowY1);
        context.lineTo(arrowX2, arrowY2);
        context.lineTo(pointBX, pointBY);
        context.fill();

        relation.drawn = true;

        if (name == undefined)
        {
            return;
        }

        let position = yIntersection / 300;
        if (get2WayRelation(relation).drawn)
        {
            position *= -1;
        }

        const midpoint = [(nodeA.x + nodeB.x) / 2, (nodeA.y + nodeB.y) / 2];

        context.font = `${100 * globalSizeModifier}% Arial`;
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.strokeStyle = "white";
        context.lineWidth = 2 * globalSizeModifier;
        context.strokeText(name, midpoint[0], ((midpoint[1] - 10) - position));
        context.fillText(name, midpoint[0], ((midpoint[1] - 10) - position));
    }

    function updateHistory()
    {

        if (history.length < 10 && (historyIndex == undefined || historyIndex == history.length - 1))
        {
            history.push({n: nodes.map(node => ({ ...node })), r: relations.map(relations => ({...relations}))});
            return;
        }

        if (historyIndex < history.length - 1)
        {
            history = history.slice(0, historyIndex + 1);
            history.push({n: nodes.map(node => ({ ...node })), r: relations.map(relations => ({...relations}))});
            historyIndex = undefined;
            return;
        }
        history.shift();
        updateHistory();
    }

    function changeHistory(forward)
    {
        if (history.length < 1)
        {
            return;
        }
        resetActiveNode();
        if (forward == true && historyIndex != undefined)
        {
            if (historyIndex < history.length - 1)
            {
                historyIndex++;
                nodes = history[historyIndex].n.map(n => ({ ...n }));
                relations = history[historyIndex].r.map(r => ({...r}));
                updateCanvas();
            }
            return;
        }

        if (historyIndex == undefined)
        {
            historyIndex = history.length - 1;
        }

        if (historyIndex > 0)
        {
            historyIndex--;
            nodes = history[historyIndex].n.map(n => ({ ...n }));
            relations = history[historyIndex].r.map(r => ({...r}));
            updateCanvas();
        }
    }

    function copy(node)
    {
        if (clipBoard.length < 1)
        {
            clipBoard.push(JSON.parse(JSON.stringify(node)));
            return;
        }
        if (clipBoard[0] == node)
        {
            return;
        }
        clipBoard.shift();
        copy(node);
    }

    function paste()
    {
        clipBoard[0].x += 20;
        clipBoard[0].id = assignId(1);
        let newNode = JSON.parse(JSON.stringify(clipBoard[0]));

        addNode(newNode);
    }

    function addNode(newNode)
    {
        nodes.push(newNode);
        selectActiveNode(newNode);
        setZValues();
        sortNodes();
        updateHistory();
        updateCanvas();
    }

    function assignId(newId)
    {
        let exists = false;

        for (let i = 0; i < nodes.length; i++)
        {
            if (nodes[i].id.charAt(1) == newId)
            {
                exists = true;
                newId++;
            }
        }
        
        if (exists)
        {
            return assignId(newId);
        }
        return "r" + newId;
    }

    function clearCanvas()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < relations.length; i++)
        {
            relations[i].drawn = false;
        }
    }


    function updateCanvas()
    {
        setCanvasSize();
        clearCanvas();
        
        drawRelations();
        drawNodes();

        if (active.length > 0)
        {
            selectActiveNode(getNode(active[5]));
            drawActive();
        }
        
    }

    // Initial draw
    updateCanvas();
    updateHistory();

    // Utility function to check if a point is inside a node angle
    function isInsideRectangle(x, y, node)
    {
        var dx = x - node.x;
        var dy = y - node.y;
        var condition = dx * dx + dy * dy <= node.radius * node.radius;

        if (condition)
        {
            addToSelected(node);
            return true;
        }
        else
        {
            return false;
        }
    }

    // Mouse down event handler
    canvas.addEventListener('mousedown', function(e)
    {
        var mouseX = e.offsetX;
        var mouseY = e.offsetY;
        nodes.forEach(function(node)
        {
            if (globalDrag)
            {
                node.isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                node.offsetX = node.x;
                node.offsetY = node.y;
                canvas.style.cursor = 'grabbing';
            }
            else if (isInsideRectangle(mouseX, mouseY, node))
            {
                node.isDragging = true;
                node.offsetX = mouseX - node.x;
                node.offsetY = mouseY - node.y;
            }

        });

        for (let i = 0; i < nodes.length; i++)
        {
            if (nodes[i].isDragging && nodes[i] == getHighestZValue())
            {
                selectActiveNode(nodes[i]);
                updateCanvas();
                break;
            }
            resetActiveNode();
            updateCanvas();
        }
    });

    // Mouse move event handler
    canvas.addEventListener('mousemove', function(e)
    {
        nodes.forEach(function(node)
        {
            let firstCondition = node.isDragging && globalDrag;
            let secondCondition = node.isDragging && node == getHighestZValue();
            if (firstCondition)
            {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
        
                node.x = node.offsetX + dx;
                node.y = node.offsetY + dy;
                updateCanvas();
                /* content.style.left = `${initialX + dx}px`;
                content.style.top = `${initialY + dy}px`; */
            }
            if (secondCondition)
            {
                node.x = e.offsetX - node.offsetX;
                node.y = e.offsetY - node.offsetY;
                selectActiveNode(node);
                updateCanvas();
            }
        });
    });

    // Mouse up event handler
    canvas.addEventListener('mouseup', function()
    {
        resetSelected();
        if (canvas.style.cursor == "grabbing")
        {
            canvas.style.cursor = "grab";
        }
        nodes.forEach(function(node)
        {
            node.isDragging = false;
        });
        updateHistory();
    });

    // Mouse out event handler to stop dragging when the mouse leaves the canvas
    canvas.addEventListener('mouseout', function()
    {
        resetSelected();
        resetCursor();
        nodes.forEach(function(node)
        {
            node.isDragging = false;
        });
    });

    let keysPressed = [];

    function updateArray(array)
    {
        if (array == undefined)
        {
            return;
        }

        let newArray = [];

        for (let i = 0; i < array.length; i++)
        {
            if (array[i] != null)
            {
                newArray.push(array[i]);
            }
        }
        return newArray;
    }

    function addToArray(array, item)
    {
        if (array == undefined)
        {
            array.push(item)
            return;
        }

        for (let i = 0; i < array.length; i++)
        {
            if (array[i] == item)
            {
                return;
            }
        }
        array.push(item);
    }

    function removeFromArray(array, item)
    {
        for (let i = 0; i < array.length; i++)
        {
            if (array[i] == item)
            {
                array[i] = null;
            }
        }

        return updateArray(array);
    }

    function checkOnlyKeysPressed(keys)
    {
        if (keysPressed.length != keys.length)
        {
            return false;
        }

        for (let i = 0; i < keys.length; i++)
        {
            if (!existsInArray(keysPressed, keys[i]))
            {
                return false;
            }
        }

        return true;
    }

    function existsInArray(array, item)
    {
        for (let i = 0; i < array.length; i++)
        {
            if (array[i] == item)
            {
                return true;
            }
        }
        return false;
    
    }

    document.addEventListener('keydown', function(e)
    {
        if (e.code == "Space")
        {
            globalDrag = true;
            if (canvas.style.cursor != "grabbing")
            {
                canvas.style.cursor = "grab";
            }
        }

        if (e.key == "z" || e.key == "Z")
        {
            if (checkOnlyKeysPressed(["Control", "Shift"]))
            {
                changeHistory(true);
            }
            else if (checkOnlyKeysPressed(["Control"]))
            {
                changeHistory();
            }

        }

        if (e.key == "c" || e.key == "C")
        {
            if (checkOnlyKeysPressed(["Control"]) && active.length > 0)
            {
                copy(getNode(active[5]));
            }
        }

        if (e.key == "v" || e.key == "V")
        {
            if (checkOnlyKeysPressed(["Control"]) && clipBoard.length > 0)
            {
                paste();
            }
        }

        addToArray(keysPressed, e.key);

    });

    document.addEventListener('keyup', function(e)
    {
        if (e.code == "Space")
        {
            globalDrag = false;
            resetCursor();
        }

        keysPressed = removeFromArray(keysPressed, e.key);

    });



    function resetCursor()
    {
        canvas.style.cursor = "default";
    }

    document.addEventListener('wheel', function(e) 
    {
        //scroll up
        //zoom in
        if (e.deltaY < 0) 
        {
            if (globalSizeModifier < maxZoomIn)
            {
                globalSizeModifier *= 1.05;
            

                for (let i = 0; i < nodes.length; i++)
                {
                    let node = nodes[i];
                    node.x *= 1.05;
                    node.y *= 1.05;
                    node.radius *= 1.05;
                }
            }
        } 
        //scroll down
        //zoom out
        else if (e.deltaY > 0) 
        {
            if (globalSizeModifier > maxZoomOut)
            {
                globalSizeModifier *= 0.95;

                for (let i = 0; i < nodes.length; i++)
                {
                    let node = nodes[i];
                    node.x *= 0.95;
                    node.y *= 0.95;
                    node.radius *= 0.95;
                }
            }
        }
        updateCanvas();
    });
}

function hideSide() 
{
    let id = null;
    let gui = document.getElementsByClassName("side")[0];   
    let pos = gui.getAttribute("pos");
    if (pos == -25)
    {
        showSide();
        return;
    }

    clearInterval(id);
    id = setInterval(frame, 5);

    function frame() 
    {
        if (pos == -25) 
        {
            clearInterval(id);
        } 
        else 
        {
            pos--; 
            gui.setAttribute("pos", pos);
            gui.style.right = pos + "%";
        }
    }
}

function showSide()
{
    let id = null;
    let gui = document.getElementsByClassName("side")[0];   
    let pos = gui.getAttribute("pos");
    clearInterval(id);
    id = setInterval(frame, 5);
    
    function frame() 
    {
        if (pos == 0) 
        {
            clearInterval(id);
        } 
        else 
        {
            pos++; 
            gui.setAttribute("pos", pos);
            gui.style.right = pos + "%";
        }
    }
}