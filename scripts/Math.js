function findIntersections(x1, y1, r1, x2, y2, r2, yIntersection) 
{
    if (yIntersection == undefined)
    {
        yIntersection = 0;
    }
    // List to store the intersection points
    const intersections = [];

    // Calculate the line equation coefficients (A, B, C) for the line passing through (x1, y1) and (x2, y2)
    //y = mx + c
    const A = y2 - y1; //rise
    const B = x1 - x2; //run
    const C = (x2 * y1 - x1 * y2) + yIntersection; //y intersection

    // Find intersections with Circle 1
    findNodeIntersections(x1, y1, r1, A, B, C, intersections);

    // Find intersections with Circle 2
    findNodeIntersections(x2, y2, r2, A, B, C, intersections);

    return intersections;
}

function findNodeIntersections(h, k, r, A, B, C, intersections) 
{
    if (B == 0) 
    { // Special case for vertical line (x = -C/A)
        const x = -C / A;
        const discriminant = r * r - (x - h) * (x - h);
        if (discriminant >= 0) 
        {
            const sqrtDiscriminant = Math.sqrt(discriminant);
            const y1 = k + sqrtDiscriminant;
            const y2 = k - sqrtDiscriminant;
            intersections.push([x, y1]);
            if (discriminant > 0) 
            {
                intersections.push([x, y2]);
            }
        }
        return;
    }
    // Substitute line equation into the circle equation
    const a = A * A + B * B;
    const b = 2 * (A * C + A * B * k - B * B * h);
    const c = C * C + 2 * B * C * k + B * B * (h * h + k * k - r * r);

    // Solve the quadratic equation for x
    const discriminant = b * b - 4 * a * c;

    if (discriminant >= 0) 
    {
        const sqrtDiscriminant = Math.sqrt(discriminant);
        const x1 = (-b + sqrtDiscriminant) / (2 * a);
        const x2 = (-b - sqrtDiscriminant) / (2 * a);
        const y1 = (-A * x1 - C) / B;
        const y2 = (-A * x2 - C) / B;
        intersections.push([x1, y1]);
        // If discriminant is positive, there are two distinct points
        if (discriminant > 0) 
        { 
            intersections.push([x2, y2]);
        }
    }
}

function findClosestPoints(nodeA, nodeB, yIntersection)
{
    let intersections = findIntersections(nodeA.x, nodeA.y, nodeA.radius, nodeB.x, nodeB.y, nodeB.radius, yIntersection);

    let nodeAPoints = [intersections[0], intersections[1]];
    let nodeBPoints = [intersections[2], intersections[3]];

    for (let i = 0; i < 2; i++)
    {
        if (nodeAPoints[i] == undefined || nodeBPoints[i] == undefined)
        {
            return;
        }
    }

    let closest = calcDistance(nodeAPoints[0], nodeBPoints[0]);
    let points = [nodeAPoints[0], nodeBPoints[0]];

    for (let i = 0; i < 2; i++)
    {
        for (let j = 0; j < 2; j++)
        {
            let distance = calcDistance(nodeAPoints[i], nodeBPoints[j]);

            if (distance < closest)
            {
                closest = distance;
                points = [nodeAPoints[i], nodeBPoints[j]];
            }
        }
    }

    return points;
}

function calcDistance(pointA, pointB)
{
    let distanceX = pointB[0] - pointA[0];
    let distanceY = pointB[1] - pointA[1];

    distanceX *= distanceX;
    distanceY *= distanceY;

    return Math.sqrt(distanceX + distanceY);
}