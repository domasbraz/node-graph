// canvasScript.js
window.onload = function()
{
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');

    var nodes = 
    [
        { x: 50, y: 50, radius: 50, color: 'blue', isDragging: false, z: 0, id: "r1", text: "Node"},
        { x: 200, y: 200, radius: 50, color: 'red', isDragging: false, z: 1, id: "r2", text: "Node"},
        { x: 350, y: 50, radius: 50, color: 'green', isDragging: false, z: 2, id: "r3", text: "Node"}
    ];

    var selected = [];

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

            context.font = '200% Arial';
            context.fillStyle = 'black';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.strokeStyle = "white";
            context.lineWidth = 2;
            context.strokeText(node.text, node.x, node.y);
            context.fillText(node.text, node.x, node.y);
        });
    }

    function clearCanvas()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function updateCanvas()
    {
        clearCanvas();
        drawArrow(nodes[0].x, nodes[0].y, nodes[1].x, nodes[1].y);
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
            if (isInsideRectangle(mouseX, mouseY, node) && selected.length < 2)
            {
                node.isDragging = true;
                node.offsetX = mouseX - node.x;
                node.offsetY = mouseY - node.y;
            }
            else if (isInsideRectangle(mouseX, mouseY, node))
            {
                node = getHighestZValue();
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
            if (node.isDragging && node == getHighestZValue())
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
        nodes.forEach(function(node)
        {
            node.isDragging = false;
        });
    });

    // Mouse out event handler to stop dragging when the mouse leaves the canvas
    canvas.addEventListener('mouseout', function()
    {
        resetSelected();
        nodes.forEach(function(node)
        {
            node.isDragging = false;
        });
    });


    function drawArrow(startX, startY, endX, endY) 
    {
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.fillStyle = 'black';

        // Draw the line
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
    
        // Draw the arrowhead
        const arrowSize = 10;
        const angle = Math.atan2(endY - startY, endX - startX);
        
        // Arrowhead points
        const arrowX1 = endX - arrowSize * Math.cos(angle - Math.PI / 6);
        const arrowY1 = endY - arrowSize * Math.sin(angle - Math.PI / 6);
        const arrowX2 = endX - arrowSize * Math.cos(angle + Math.PI / 6);
        const arrowY2 = endY - arrowSize * Math.sin(angle + Math.PI / 6);
    
        context.beginPath();
        context.moveTo(endX, endY);
        context.lineTo(arrowX1, arrowY1);
        context.lineTo(arrowX2, arrowY2);
        context.lineTo(endX, endY);
        context.fill();
    }

}
