// canvasScript.js
window.onload = function()
{
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var nodes = 
    [
        { x: 50, y: 50, radius: 30, color: 'blue', isDragging: false, z: 0, id: "r1", text: "Node"},
        { x: 200, y: 200, radius: 30, color: 'red', isDragging: false, z: 1, id: "r2", text: "Node"},
        { x: 350, y: 50, radius: 30, color: 'green', isDragging: false, z: 2, id: "r3", text: "Node"}
    ];

    var selected = [];
    var globalDrag = false;
    var startX, startY;

    var globalSizeModifier = 1;

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
            context.lineWidth = 2;
            context.strokeText(node.text, node.x, node.y);
            context.fillText(node.text, node.x, node.y);
        });
    }

    function drawArrow(nodeA, nodeB) 
    {
        if (nodeA.x == nodeB.x && nodeA.y == nodeB.y)
        {
            return;
        }
        const nodePoints = findClosestPoints(nodeA, nodeB);

        if (nodePoints == undefined)
        {
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

        const midpoint = [(nodeA.x + nodeB.x) / 2, (nodeA.y + nodeB.y) / 2];

        context.font = `${100 * globalSizeModifier}% Arial`;
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.strokeStyle = "white";
        context.lineWidth = 2;
        context.strokeText("line", midpoint[0], midpoint[1] - 10 * globalSizeModifier);
        context.fillText("line", midpoint[0], midpoint[1] - 10 * globalSizeModifier);
    }

    function clearCanvas()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function updateCanvas()
    {
        clearCanvas();
        
        drawArrow(nodes[0], nodes[1]);
        drawNodes();
        
    }

    // Initial draw
    updateCanvas();

    // Utility function to check if a point is inside a nodeangle
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
    });

    document.addEventListener('keyup', function(e)
    {
        if (e.code == "Space")
        {
            globalDrag = false;
            resetCursor();
        }
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
            globalNodeText *= 1.2;
            globalRelText *= 1.2;
            globalArrowSize *= 1.2;
            globalLineWidth *= 1.2;
            globalSizeModifier *= 1.2;

            for (let i = 0; i < nodes.length; i++)
            {
                let node = nodes[i];
                node.x *= 1.2;
                node.y *= 1.2;
                node.radius *= 1.2;
            }
        } 
        //scroll down
        //zoom out
        else if (e.deltaY > 0) 
        {
            globalNodeText *= 0.9;
            globalRelText *= 0.9;
            globalArrowSize *= 0.9;
            globalLineWidth *= 0.9;
            globalSizeModifier *= 0.9;

            for (let i = 0; i < nodes.length; i++)
            {
                let node = nodes[i];
                node.x *= 0.9;
                node.y *= 0.9;
                node.radius *= 0.9;
            }
        }
        updateCanvas();
    });
}
