// Initialize visualization area
document.addEventListener('DOMContentLoaded', () => {
    const width = document.getElementById('networkVisualization').clientWidth;
    const height = 500;

    // Create zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.5, 5])  // Allow zoom from 0.5x to 5x
        .on('zoom', zoomed);

    const svg = d3.select('#networkVisualization')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .call(zoom);  // Enable zoom behavior

    // Create a container group for all elements
    const container = svg.append('g')
        .attr('class', 'container');

    // Add zoom controls
    const zoomControls = d3.select('#networkVisualization')
        .append('div')
        .attr('class', 'zoom-controls')
        .style('position', 'absolute')
        .style('top', '10px')
        .style('right', '10px');

    zoomControls.append('button')
        .attr('class', 'btn btn-sm btn-primary me-2')
        .text('+')
        .on('click', () => {
            svg.transition()
                .duration(300)
                .call(zoom.scaleBy, 1.3);
        });

    zoomControls.append('button')
        .attr('class', 'btn btn-sm btn-primary me-2')
        .text('-')
        .on('click', () => {
            svg.transition()
                .duration(300)
                .call(zoom.scaleBy, 0.7);
        });

    zoomControls.append('button')
        .attr('class', 'btn btn-sm btn-secondary')
        .text('Reset')
        .on('click', () => {
            svg.transition()
                .duration(300)
                .call(zoom.transform, d3.zoomIdentity);
        });

    // Constants for ranges
    const ESP_RANGE = Math.min(width, height) * 0.3; // ESP range increased to 30% (25% + 20%)
    const BASE_RANGE = Math.min(width, height) * 0.96; // Base range increased to 96% (80% + 20%)

    // Base station data
    const baseStation = {
        id: 'BASE001',
        x: width / 2,
        y: height / 2,
        status: 'Online',
        range: BASE_RANGE
    };

    // Island configuration
    const island = {
        x: baseStation.x,
        y: baseStation.y,
        radius: 30  // Small enough to not interfere with ESP nodes
    };

    // Function to check if a point is inside the island
    function isInsideIsland(x, y) {
        return getDistance(x, y, island.x, island.y) <= island.radius;
    }

    // Simulated data for demonstration
    const ships = [
        { id: 'SHIP001', x: width * 0.3, y: height * 0.4, speed: 0.003, angle: Math.random() * 360, lastDetectedBy: null, status: 'Active', type: 'Cargo', messages: [] },
        { id: 'SHIP002', x: width * 0.6, y: height * 0.3, speed: 0.002, angle: Math.random() * 360, lastDetectedBy: null, status: 'Active', type: 'Tanker', messages: [] },
        { id: 'SHIP003', x: width * 0.5, y: height * 0.6, speed: 0.0025, angle: Math.random() * 360, lastDetectedBy: null, status: 'Active', type: 'Container', messages: [] },
        { id: 'SHIP004', x: width * 0.7, y: height * 0.4, speed: 0.003, angle: Math.random() * 360, lastDetectedBy: null, status: 'Active', type: 'Fishing', messages: [] },
        { id: 'SHIP005', x: width * 0.4, y: height * 0.7, speed: 0.0025, angle: Math.random() * 360, lastDetectedBy: null, status: 'Active', type: 'Passenger', messages: [] }
    ];

    const espNodes = [
        // Random positions across the area
        { id: 'ESP001', x: width * 0.22, y: height * 0.18, battery: 85, solar: '4.2W', range: ESP_RANGE, status: 'Online', chargeRate: 0, dischargeRate: 0 },
        { id: 'ESP002', x: width * 0.45, y: height * 0.12, battery: 92, solar: '3.8W', range: ESP_RANGE, status: 'Online', chargeRate: 0, dischargeRate: 0 },
        { id: 'ESP003', x: width * 0.78, y: height * 0.25, battery: 78, solar: '4.0W', range: ESP_RANGE, status: 'Online', chargeRate: 0, dischargeRate: 0 },
        { id: 'ESP004', x: width * 0.92, y: height * 0.45, battery: 88, solar: '3.9W', range: ESP_RANGE, status: 'Online', chargeRate: 0, dischargeRate: 0 },
        { id: 'ESP005', x: width * 0.75, y: height * 0.58, battery: 95, solar: '4.1W', range: ESP_RANGE, status: 'Online', chargeRate: 0, dischargeRate: 0 },
        { id: 'ESP006', x: width * 0.88, y: height * 0.82, battery: 82, solar: '3.7W', range: ESP_RANGE, status: 'Online', chargeRate: 0, dischargeRate: 0 },
        { id: 'ESP007', x: width * 0.35, y: height * 0.92, battery: 89, solar: '4.3W', range: ESP_RANGE, status: 'Online', chargeRate: 0, dischargeRate: 0 },
        { id: 'ESP008', x: width * 0.52, y: height * 0.78, battery: 91, solar: '4.0W', range: ESP_RANGE, status: 'Online', chargeRate: 0, dischargeRate: 0 },
        { id: 'ESP009', x: width * 0.62, y: height * 0.68, battery: 87, solar: '3.9W', range: ESP_RANGE, status: 'Online', chargeRate: 0, dischargeRate: 0 },
        { id: 'ESP010', x: width * 0.08, y: height * 0.38, battery: 93, solar: '4.1W', range: ESP_RANGE, status: 'Online', chargeRate: 0, dischargeRate: 0 },
        { id: 'ESP011', x: width * 0.15, y: height * 0.62, battery: 86, solar: '3.8W', range: ESP_RANGE, status: 'Online', chargeRate: 0, dischargeRate: 0 },
        { id: 'ESP012', x: width * 0.28, y: height * 0.48, battery: 90, solar: '4.0W', range: ESP_RANGE, status: 'Online', chargeRate: 0, dischargeRate: 0 }
    ];

    // Adjust ESP positions relative to base station
    espNodes.forEach((esp, index) => {
        const angle = (index * 2 * Math.PI) / espNodes.length;
        const radius = BASE_RANGE * 0.7; // Keep same relative positioning
        esp.x = baseStation.x + radius * Math.cos(angle);
        esp.y = baseStation.y + radius * Math.sin(angle);
        esp.range = ESP_RANGE;
    });

    // Adjust initial ship positions relative to base station
    ships.forEach((ship, index) => {
        const angle = (index * 2 * Math.PI) / ships.length;
        const radius = BASE_RANGE * 0.6; // Keep same relative positioning
        ship.x = baseStation.x + radius * Math.cos(angle);
        ship.y = baseStation.y + radius * Math.sin(angle);
    });

    // Zoom function
    function zoomed(event) {
        container.attr('transform', event.transform);
    }

    // Calculate distance between two points
    function getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    // Find connections between ESPs based on range
    function updateEspConnections() {
        espNodes.forEach(esp => {
            esp.connectedTo = [];
            // Connect to other ESPs in range
            espNodes.forEach(target => {
                if (esp.id !== target.id) {
                    const distance = getDistance(esp.x, esp.y, target.x, target.y);
                    if (distance <= esp.range + target.range) {
                        esp.connectedTo.push(target.id);
                    }
                }
            });
        });
    }

    // Draw base station range
    function drawBaseStationRange() {
        // Remove existing range circle
        container.selectAll('.base-range').remove();
        
        // Draw range circle
        container.append('circle')
            .attr('class', 'base-range')
            .attr('cx', baseStation.x)
            .attr('cy', baseStation.y)
            .attr('r', baseStation.range)
            .style('fill', 'none')
            .style('stroke', '#4CAF50')
            .style('stroke-width', 2)
            .style('stroke-dasharray', '10,10')
            .style('opacity', 0.3);
    }

    // Draw ESP ranges
    function drawEspRanges() {
        // Remove existing range circles
        container.selectAll('.esp-range').remove();
        
        // Draw range circles for each ESP
        espNodes.forEach(esp => {
            container.append('circle')
                .attr('class', 'esp-range')
                .attr('cx', esp.x)
                .attr('cy', esp.y)
                .attr('r', esp.range)
                .style('fill', 'none')
                .style('stroke', '#007bff')
                .style('stroke-width', 1)
                .style('stroke-dasharray', '5,5')
                .style('opacity', 0.2);
        });
    }

    // Function to format base station details
    function formatBaseDetails(base) {
        const connectedEsps = espNodes.map(esp => esp.id).join(', ');
        const activeShips = ships.filter(ship => 
            getDistance(ship.x, ship.y, base.x, base.y) <= base.range
        ).length;

        return `
            <div class="base-details">
                <h6 class="mb-2">${base.id}</h6>
                <p class="mb-1"><strong>Status:</strong> ${base.status}</p>
                <p class="mb-1"><strong>Coverage Range:</strong> 40km</p>
                <p class="mb-1"><strong>Connected ESPs:</strong> ${espNodes.length}</p>
                <p class="mb-1"><strong>Active Ships:</strong> ${activeShips}</p>
                <p class="mb-1"><strong>Network Load:</strong> ${document.getElementById('networkLoad').textContent}</p>
                <p class="mb-0"><strong>Storage Used:</strong> ${document.getElementById('storageUsed').textContent}</p>
            </div>
        `;
    }

    // Draw base station
    function drawBaseStation() {
        // Remove existing base station and island
        container.selectAll('.base-station, .island').remove();
        
        // Draw island
        container.append('g')
            .attr('class', 'island')
            .attr('transform', `translate(${island.x},${island.y})`)
            .append('path')
            .attr('d', d3.symbol().type(d3.symbolCircle).size(Math.PI * island.radius * island.radius))
            .style('fill', '#c2b280')  // Sandy color
            .style('stroke', '#8b4513')  // Brown edge
            .style('stroke-width', 2);

        // Add some vegetation details to the island
        const vegetation = container.select('.island')
            .append('g')
            .attr('class', 'vegetation');

        // Add small trees/bushes randomly
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const r = island.radius * 0.6;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            
            vegetation.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 3)
                .style('fill', '#228b22');  // Forest green
        }

        // Draw base station (moved up slightly to appear on the island)
        const baseGroup = container.append('g')
            .attr('class', 'base-station')
            .attr('transform', `translate(${baseStation.x},${baseStation.y - 5})`);

        // Draw base platform
        baseGroup.append('rect')
            .attr('x', -15)
            .attr('y', 15)
            .attr('width', 30)
            .attr('height', 8)
            .style('fill', '#4CAF50');

        // Draw tower structure
        baseGroup.append('path')
            .attr('d', `
                M -2,15 L -2,-25 L 2,-25 L 2,15
                M -12,10 L -2,-20
                M 12,10 L 2,-20
                M -8,-10 L 8,-10
                M -6,-20 L 6,-20
            `)
            .style('stroke', '#4CAF50')
            .style('stroke-width', '2')
            .style('fill', 'none');

        // Draw antenna dishes
        baseGroup.append('path')
            .attr('d', `
                M -8,-22 L -12,-22 L -12,-18 L -8,-18 Z
                M 8,-22 L 12,-22 L 12,-18 L 8,-18 Z
            `)
            .style('fill', '#4CAF50');

        // Draw radio waves
        const waves = baseGroup.append('g')
            .attr('class', 'radio-waves');

        // Left wave
        waves.append('path')
            .attr('d', 'M -12,-20 Q -16,-20 -18,-16')
            .style('stroke', '#4CAF50')
            .style('stroke-width', '1')
            .style('fill', 'none')
            .style('opacity', '0.6');

        // Right wave
        waves.append('path')
            .attr('d', 'M 12,-20 Q 16,-20 18,-16')
            .style('stroke', '#4CAF50')
            .style('stroke-width', '1')
            .style('fill', 'none')
            .style('opacity', '0.6');

        // Add status light
        baseGroup.append('circle')
            .attr('cx', 0)
            .attr('cy', -28)
            .attr('r', 2)
            .style('fill', baseStation.status === 'Online' ? '#ff0000' : '#666')
            .style('opacity', baseStation.status === 'Online' ? 
                function() {
                    let opacity = 1;
                    d3.interval(() => {
                        d3.select(this)
                            .transition()
                            .duration(1000)
                            .style('opacity', opacity)
                            .transition()
                            .duration(1000)
                            .style('opacity', 0.3);
                        opacity = opacity === 1 ? 0.3 : 1;
                    }, 2000);
                    return 1;
                }() : 1
            );

        // Add label
        baseGroup.append('text')
            .attr('dy', 35)
            .style('text-anchor', 'middle')
            .style('fill', '#333')
            .style('font-weight', 'bold')
            .text(baseStation.id);

        // Add hover and click interactions
        baseGroup
            .style('cursor', 'pointer')
            .on('mouseover', function(event) {
                tooltip.html(formatBaseDetails(baseStation))
                    .style('visibility', 'visible')
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
                
                d3.select(this).selectAll('path, rect')
                    .style('fill', '#45a049')
                    .style('stroke', '#45a049');
            })
            .on('mousemove', function(event) {
                tooltip.style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', function() {
                tooltip.style('visibility', 'hidden');
                d3.select(this).selectAll('path, rect')
                    .style('fill', '#4CAF50')
                    .style('stroke', '#4CAF50');
            })
            .on('click', function(event) {
                event.stopPropagation();
                
                // Hide any existing detail panels
                d3.selectAll('.base-detail-panel').remove();
                
                // Create detail panel
                const panel = container.append('g')
                    .attr('class', 'base-detail-panel')
                    .attr('transform', `translate(${baseStation.x + 20},${baseStation.y})`);
                
                // Add white background
                panel.append('rect')
                    .attr('width', 220)
                    .attr('height', 280)
                    .attr('fill', 'white')
                    .attr('stroke', '#4CAF50')
                    .attr('rx', 5);
                
                // Add details
                const details = panel.append('g')
                    .attr('transform', 'translate(10,20)');
                
                details.append('text')
                    .attr('y', 0)
                    .style('font-weight', 'bold')
                    .text(baseStation.id);
                
                details.append('text')
                    .attr('y', 30)
                    .text(`Status: ${baseStation.status}`);
                
                details.append('text')
                    .attr('y', 60)
                    .text('Coverage Range: 40km');
                
                details.append('text')
                    .attr('y', 90)
                    .text(`Connected ESPs: ${espNodes.length}`);
                
                // List all connected ESPs
                details.append('text')
                    .attr('y', 110)
                    .text('ESP Nodes:');
                
                const espList = espNodes.map(esp => esp.id);
                for (let i = 0; i < espList.length; i += 2) {
                    details.append('text')
                        .attr('y', 130 + Math.floor(i/2) * 20)
                        .attr('x', 10)
                        .style('font-size', '0.8em')
                        .text(espList[i]);
                    
                    if (espList[i+1]) {
                        details.append('text')
                            .attr('y', 130 + Math.floor(i/2) * 20)
                            .attr('x', 110)
                            .style('font-size', '0.8em')
                            .text(espList[i+1]);
                    }
                }

                const activeShips = ships.filter(ship => 
                    getDistance(ship.x, ship.y, baseStation.x, baseStation.y) <= baseStation.range
                ).length;

                details.append('text')
                    .attr('y', 230)
                    .text(`Active Ships: ${activeShips}`);
                
                details.append('text')
                    .attr('y', 250)
                    .text(`Network Load: ${document.getElementById('networkLoad').textContent}`);
                
                details.append('text')
                    .attr('y', 270)
                    .text(`Storage Used: ${document.getElementById('storageUsed').textContent}`);
                
                // Add close button
                const closeBtn = panel.append('g')
                    .attr('transform', 'translate(200,10)')
                    .style('cursor', 'pointer')
                    .on('click', function(event) {
                        event.stopPropagation();
                        panel.remove();
                    });
                
                closeBtn.append('circle')
                    .attr('r', 8)
                    .attr('fill', '#dc3545');
                
                closeBtn.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', '0.3em')
                    .attr('fill', 'white')
                    .style('font-size', '0.8em')
                    .text('×');
            });
    }

    // Draw network connections
    function drawConnections() {
        // Remove existing connections
        container.selectAll('.connection').remove();
        
        // Draw new connections
        espNodes.forEach(esp => {
            // Always draw connection to base station
            container.append('line')
                .attr('class', 'connection')
                .attr('x1', esp.x)
                .attr('y1', esp.y)
                .attr('x2', baseStation.x)
                .attr('y2', baseStation.y)
                .style('stroke', '#4CAF50')
                .style('stroke-width', 2)
                .style('stroke-dasharray', '5,5')
                .style('opacity', 0.5);
            
            // Draw ESP mesh connections
            esp.connectedTo.forEach(targetId => {
                const target = espNodes.find(n => n.id === targetId);
                if (target) {
                    container.append('line')
                        .attr('class', 'connection')
                        .attr('x1', esp.x)
                        .attr('y1', esp.y)
                        .attr('x2', target.x)
                        .attr('y2', target.y)
                        .style('stroke', '#007bff')
                        .style('stroke-width', 2)
                        .style('stroke-dasharray', '5,5')
                        .style('opacity', 0.3);
                }
            });
        });
    }

    // Ship type icons (Unicode symbols)
    const shipIcons = {
        'Cargo': '🚢',
        'Tanker': '⛴️',
        'Container': '🚢',
        'Fishing': '⛵',
        'Passenger': '🛳️'
    };

    // ESP tooltip div
    const tooltip = d3.select('#networkVisualization')
        .append('div')
        .attr('class', 'esp-tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '10px')
        .style('border-radius', '5px')
        .style('font-size', '12px')
        .style('max-width', '200px')
        .style('z-index', '1000');

    // Function to format ESP details for tooltip
    function formatEspDetails(esp) {
        const batteryColor = esp.battery > 60 ? 'green' : esp.battery > 30 ? 'orange' : 'red';
        const solarStatus = esp.solar === 'Active';
        
        return `
            <div class="esp-tooltip">
                <div class="esp-header">${esp.id}</div>
                <div class="esp-status">Status: ${esp.status}</div>
                <div class="esp-battery" style="color: ${batteryColor}">
                    Battery: ${esp.battery.toFixed(1)}%
                </div>
                <div class="esp-solar" style="color: ${solarStatus ? '#4CAF50' : '#ff0000'}">
                    ${solarStatus ? 
                        `Charging (+${esp.chargeRate.toFixed(1)}%)` : 
                        `Discharging (-${esp.dischargeRate.toFixed(1)}%)`}
                </div>
            </div>
        `;
    }

    function drawEspNodes() {
        // Remove existing ESP nodes
        container.selectAll('.esp-node').remove();
        container.selectAll('.esp-label').remove();
        container.selectAll('.esp-battery').remove();
        container.selectAll('.esp-battery-background').remove();

        // Draw ESP nodes
        espNodes.forEach(esp => {
            // Draw ESP node circle
            container.append('circle')
                .attr('class', 'esp-node')
                .attr('cx', esp.x)
                .attr('cy', esp.y)
                .attr('r', 8)
                .style('fill', esp.battery > 20 ? '#4CAF50' : '#ff0000');

            // Draw battery background bar
            container.append('rect')
                .attr('class', 'esp-battery-background')
                .attr('x', esp.x - 20)
                .attr('y', esp.y - 25)
                .attr('width', 40)
                .attr('height', 10)
                .attr('rx', 2)
                .style('fill', '#ddd');

            // Draw battery level bar
            container.append('rect')
                .attr('class', 'esp-battery')
                .attr('x', esp.x - 19)
                .attr('y', esp.y - 24)
                .attr('width', Math.max(0, (esp.battery / 100) * 38))
                .attr('height', 8)
                .attr('rx', 1)
                .style('fill', getBatteryColor(esp.battery));

            // Draw ESP label with battery percentage and charging status
            container.append('text')
                .attr('class', 'esp-label')
                .attr('x', esp.x)
                .attr('y', esp.y + 20)
                .attr('text-anchor', 'middle')
                .style('fill', '#333')
                .style('font-size', '12px')
                .text(`${esp.id} (${esp.battery}%)`);

            // Draw charging status and rate
            container.append('text')
                .attr('class', 'esp-label')
                .attr('x', esp.x)
                .attr('y', esp.y + 35)
                .attr('text-anchor', 'middle')
                .style('fill', esp.solar === 'Active' ? '#4CAF50' : '#ff0000')
                .style('font-size', '11px')
                .text(esp.solar === 'Active' ? 
                    `Charging (+${esp.chargeRate.toFixed(1)}%)` : 
                    `Discharging (-${esp.dischargeRate.toFixed(1)}%)`);
        });
    }

    function getBatteryColor(level) {
        if (level > 60) return '#4CAF50';  // Green
        if (level > 30) return '#FFA500';  // Orange
        return '#ff0000';  // Red
    }

    // Draw ships with icons
    function drawShips() {
        // Remove existing ships
        container.selectAll('.ship').remove();
        
        // Draw new ships
        const shipGroups = container.selectAll('.ship')
            .data(ships)
            .enter()
            .append('g')
            .attr('class', 'ship')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        // Add ship icons
        shipGroups.append('text')
            .attr('class', 'ship-icon')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.3em')
            .style('font-size', '24px')
            .text(d => shipIcons[d.type]);

        shipGroups.append('text')
            .attr('dy', 25)
            .style('text-anchor', 'middle')
            .style('fill', '#333')
            .style('font-size', '12px')
            .text(d => d.id);
    }

    // Update ship table
    function updateShipTable() {
        const tbody = document.getElementById('shipTableBody');
        tbody.innerHTML = '';
        
        ships.forEach(ship => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ship.id}</td>
                <td>${ship.lastDetectedBy}</td>
                <td><span class="badge bg-success">${ship.status}</span></td>
                <td>${ship.type}</td>
            `;
            tbody.appendChild(row);
        });

        // Update active ships count
        document.getElementById('activeShips').textContent = ships.length;
    }

    // Update ESP table
    function updateEspTable() {
        const tableBody = document.getElementById('espTableBody');
        if (!tableBody) return;

        // Clear existing rows
        tableBody.innerHTML = '';

        // Add row for each ESP node
        espNodes.forEach(esp => {
            const row = document.createElement('tr');
            const batteryColor = esp.battery > 60 ? 'green' : esp.battery > 30 ? 'orange' : 'red';
            const solarStatus = esp.solar === 'Active';

            row.innerHTML = `
                <td>${esp.id}</td>
                <td>${esp.status}</td>
                <td style="color: ${batteryColor}">${esp.battery.toFixed(1)}%</td>
                <td style="color: ${solarStatus ? '#4CAF50' : '#ff0000'}">
                    ${solarStatus ? 
                        `Charging (+${esp.chargeRate.toFixed(1)}%)` : 
                        `Discharging (-${esp.dischargeRate.toFixed(1)}%)`}
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Add message to log
    function addMessageToLog(message) {
        const messageLog = document.getElementById('messageLog');
        const messageElement = document.createElement('div');
        messageElement.className = 'list-group-item';
        
        messageElement.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${message.from} → ${message.to}</h6>
                <small>${simulationTime.toLocaleTimeString()}</small>
            </div>
            <p class="mb-1">${message.content}</p>
        `;
        
        messageLog.insertBefore(messageElement, messageLog.firstChild);
    }

    // Generate random message
    function generateRandomMessage() {
        const types = ['Detection', 'Status Update', 'Warning', 'Navigation', 'Weather'];
        const randomShip = ships[Math.floor(Math.random() * ships.length)];
        const randomEsp = espNodes[Math.floor(Math.random() * espNodes.length)];
        
        const messageTypes = {
            'Detection': `Detected ${randomShip.id} within range`,
            'Status Update': `${randomShip.id} operating normally at normal speed`,
            'Warning': `High traffic area, multiple vessels nearby`,
            'Navigation': `${randomShip.id} heading North-East`,
            'Weather': `Sea state moderate, wind 15 knots from NW`
        };
        
        const type = types[Math.floor(Math.random() * types.length)];
        
        addMessageToLog({
            from: randomEsp.id,
            to: 'Base Station',
            type: type,
            content: messageTypes[type]
        });
    }

    // Update system statistics
    function updateSystemStats() {
        document.getElementById('networkLoad').textContent = Math.floor(Math.random() * 30 + 70) + '%';
        document.getElementById('storageUsed').textContent = Math.floor(Math.random() * 20 + 30) + '%';
        document.getElementById('activeEsps').textContent = espNodes.length;
    }

    // Add timestamp tracking for smooth movement
    let lastTime = Date.now();
    
    function moveShips() {
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
        lastTime = currentTime;

        ships.forEach(ship => {
            updateShipPosition(ship, deltaTime);
        });
    }

    function updateShipPosition(ship, deltaTime) {
        const oldX = ship.x;
        const oldY = ship.y;
        
        // Update position based on speed and time delta for smooth movement
        ship.x += Math.cos(ship.angle * Math.PI / 180) * ship.speed * width * deltaTime * 60;
        ship.y += Math.sin(ship.angle * Math.PI / 180) * ship.speed * height * deltaTime * 60;

        // Check if ship is too close to island
        if (isInsideIsland(ship.x, ship.y)) {
            // Move back to previous position
            ship.x = oldX;
            ship.y = oldY;
            
            // Add slight randomization to prevent ships from getting stuck
            ship.angle = (ship.angle + (Math.random() - 0.5) * 45) % 360;
        }

        // Check if ship is outside base station range
        const distanceToBase = Math.sqrt(Math.pow(ship.x - baseStation.x, 2) + Math.pow(ship.y - baseStation.y, 2));
        if (distanceToBase > baseStation.range) {
            // Turn towards center
            const angleToCenter = Math.atan2(
                baseStation.y - ship.y,
                baseStation.x - ship.x
            ) * 180 / Math.PI;
            ship.angle = angleToCenter;
            
            // Move back inside range
            ship.x = oldX;
            ship.y = oldY;
        }

        // Randomly change direction occasionally with smoother transitions
        if (Math.random() < 0.01) {
            ship.angle = (ship.angle + (Math.random() - 0.5) * 30) % 360;
        }
    }

    // Function to check ship detection by ESP nodes
    function checkShipDetection() {
        ships.forEach(ship => {
            let previousDetector = ship.lastDetectedBy;
            ship.lastDetectedBy = null;

            // Check which ESP nodes can detect the ship
            espNodes.forEach(esp => {
                const distToEsp = getDistance(ship.x, ship.y, esp.x, esp.y);
                if (distToEsp <= esp.range) {
                    ship.lastDetectedBy = esp.id;
                    
                    // If newly detected by this ESP, send a message
                    if (previousDetector !== esp.id) {
                        // Calculate ship position
                        const shipLat = projection.invert([ship.x, ship.y])[1].toFixed(4);
                        const shipLong = projection.invert([ship.x, ship.y])[0].toFixed(4);
                        
                        addMessageToLog({
                            from: esp.id,
                            to: 'BASE001',
                            type: 'Detection',
                            content: `Detected ${ship.id} (${ship.type}) at position [${shipLat}°N, ${shipLong}°E]`
                        });
                    }
                }
            });
        });
    }

    // Weather and navigation message generators
    const weatherConditions = [
        { condition: 'Clear skies', windSpeed: '10-15 knots', waveHeight: '1-2m' },
        { condition: 'Partly cloudy', windSpeed: '15-20 knots', waveHeight: '2-3m' },
        { condition: 'Overcast', windSpeed: '20-25 knots', waveHeight: '3-4m' },
        { condition: 'Light rain', windSpeed: '25-30 knots', waveHeight: '4-5m' },
        { condition: 'Heavy rain', windSpeed: '30-35 knots', waveHeight: '5-6m' },
        { condition: 'Storm warning', windSpeed: '35+ knots', waveHeight: '6m+' }
    ];

    const navigationAlerts = [
        'Maintaining current course',
        'Adjusting course 10° starboard',
        'Adjusting course 10° port',
        'Reducing speed for safety',
        'Increasing speed to maintain schedule',
        'Caution: shallow waters ahead',
        'Warning: high traffic area',
        'Notice: fishing vessels nearby',
        'Alert: restricted visibility area',
        'Update: entering shipping lane'
    ];

    function generateWeatherReport() {
        const weather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        return `Weather Report - Conditions: ${weather.condition}, Wind: ${weather.windSpeed}, Waves: ${weather.waveHeight}`;
    }

    function generateNavigationMessage() {
        return navigationAlerts[Math.floor(Math.random() * navigationAlerts.length)];
    }

    // Function to check ship-to-ship communication
    function checkShipCommunication() {
        // Get all ships detected by each ESP
        const espDetections = {};
        espNodes.forEach(esp => {
            espDetections[esp.id] = [];
            ships.forEach(ship => {
                const distToEsp = getDistance(ship.x, ship.y, esp.x, esp.y);
                if (distToEsp <= esp.range) {
                    espDetections[esp.id].push(ship);
                }
            });
        });

        // Check for ships that can communicate through the same ESP
        espNodes.forEach(esp => {
            const detectedShips = espDetections[esp.id];
            if (detectedShips.length >= 2) {
                // Generate messages between ships in range
                for (let i = 0; i < detectedShips.length; i++) {
                    for (let j = i + 1; j < detectedShips.length; j++) {
                        const ship1 = detectedShips[i];
                        const ship2 = detectedShips[j];
                        
                        // Calculate ship positions
                        const ship1Lat = projection.invert([ship1.x, ship1.y])[1].toFixed(4);
                        const ship1Long = projection.invert([ship1.x, ship1.y])[0].toFixed(4);
                        const ship2Lat = projection.invert([ship2.x, ship2.y])[1].toFixed(4);
                        const ship2Long = projection.invert([ship2.x, ship2.y])[0].toFixed(4);
                        
                        // Calculate distance between ships
                        const shipDistance = getDistance(ship1.x, ship1.y, ship2.x, ship2.y).toFixed(2);

                        // Randomly select message type
                        const messageTypes = ['Position', 'Weather', 'Navigation'];
                        const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];

                        let messageContent = '';
                        switch(messageType) {
                            case 'Position':
                                messageContent = `Distance to ${ship2.id}: ${shipDistance}km. My position: [${ship1Lat}°N, ${ship1Long}°E], Your position: [${ship2Lat}°N, ${ship2Long}°E]`;
                                break;
                            case 'Weather':
                                messageContent = generateWeatherReport();
                                break;
                            case 'Navigation':
                                messageContent = generateNavigationMessage();
                                break;
                        }
                        
                        // Log the message through ESP
                        addMessageToLog({
                            from: ship1.id,
                            to: ship2.id,
                            type: `${messageType} Update via ${esp.id}`,
                            content: messageContent
                        });

                        // Add random delay before next message
                        if (Math.random() < 0.7) return; // 70% chance to skip additional messages
                    }
                }
            }
        });
    }

    // Time simulation
    let simulationTime = new Date();
    simulationTime.setHours(0, 0, 0); // Start at midnight

    // Constants for day/night cycle
    const SIMULATION_SPEED = 60000 / 24; // One day = 60000ms (1 minute) / 24 hours
    const SUNRISE_HOUR = 6;
    const SUNSET_HOUR = 18;

    // Function to draw time on visualization
    function drawTimeDisplay() {
        // Remove existing time display
        container.selectAll('.time-display').remove();

        // Add new time display
        const timeGroup = container.append('g')
            .attr('class', 'time-display')
            .attr('transform', `translate(${width - 150}, 30)`);

        // Background for time display
        timeGroup.append('rect')
            .attr('width', 130)
            .attr('height', 60)
            .attr('rx', 5)
            .attr('ry', 5)
            .style('fill', 'rgba(255, 255, 255, 0.9)')
            .style('stroke', '#333')
            .style('stroke-width', '1px');

        // Time text
        timeGroup.append('text')
            .attr('x', 65)
            .attr('y', 25)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', '#333')
            .text(simulationTime.toLocaleTimeString());

        // Day/Night status
        const isDaytime = simulationTime.getHours() >= SUNRISE_HOUR && simulationTime.getHours() < SUNSET_HOUR;
        timeGroup.append('text')
            .attr('x', 65)
            .attr('y', 45)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('fill', isDaytime ? '#ff9900' : '#0066cc')
            .text(isDaytime ? 'Day (Charging)' : 'Night (Discharging)');

        return isDaytime;
    }

    // Function to update ESP battery levels
    function updateBatteryLevels(isDaytime) {
        espNodes.forEach(esp => {
            const oldBattery = esp.battery;
            
            if (isDaytime) {
                // Charging during day based on solar intensity
                const solarEfficiency = Math.random();
                const chargeRate = 4.5 + (solarEfficiency * 2.7);
                esp.battery = Math.min(100, esp.battery + chargeRate);
                esp.solar = 'Active';
                esp.chargeRate = chargeRate;
                esp.dischargeRate = 0;
                
                console.log(`[${simulationTime.toLocaleDateString()} ${simulationTime.toLocaleTimeString()}] ESP ${esp.id}: Battery ${oldBattery.toFixed(1)}% -> ${esp.battery.toFixed(1)}% (Charging +${chargeRate.toFixed(1)}%)`);
            } else {
                // Discharging at night with variable rate
                const dischargeVariation = Math.random() * 1.4;
                const dischargeRate = 4.8 + dischargeVariation;
                esp.battery = Math.max(0, esp.battery - dischargeRate);
                esp.solar = 'Inactive';
                esp.chargeRate = 0;
                esp.dischargeRate = dischargeRate;
                
                console.log(`[${simulationTime.toLocaleDateString()} ${simulationTime.toLocaleTimeString()}] ESP ${esp.id}: Battery ${oldBattery.toFixed(1)}% -> ${esp.battery.toFixed(1)}% (Discharging -${dischargeRate.toFixed(1)}%)`);
            }
            
            // Keep battery level within bounds and format to 1 decimal place
            esp.battery = Math.min(100, Math.max(0, esp.battery));
            esp.battery = parseFloat(esp.battery.toFixed(1));
        });
    }

    // Update dashboard function to include time simulation
    function updateDashboard() {
        // Update simulation time (advance by 1 hour)
        simulationTime.setTime(simulationTime.getTime() + (60 * 60 * 1000));
        if (simulationTime.getHours() === 0) {
            simulationTime.setDate(simulationTime.getDate() + 1);
        }

        // Update time and battery related items
        const isDaytime = drawTimeDisplay();
        updateBatteryLevels(isDaytime);

        updateEspConnections();
        checkShipDetection();
        checkShipCommunication();
        drawBaseStationRange();
        drawEspRanges();
        drawConnections();
        drawBaseStation();
        drawEspNodes();  // Add this back to draw ESP nodes with battery indicators
        updateShipTable();
        updateEspTable();
        updateSystemStats();
        
        // Generate a random message occasionally
        if (Math.random() < 0.3) {
            generateRandomMessage();
        }
    }

    // Separate animation loop for smooth ship movement
    function animate() {
        moveShips();
        drawShips();
        requestAnimationFrame(animate);
    }

    // Map configuration
    const mapConfig = {
        scale: Math.min(width, height) * 2,
        center: [-157.8583, 21.3069],  // Honolulu coordinates
        hawaii: {
            x: width / 2,
            y: height / 2
        }
    };

    // Create the map projection
    const projection = d3.geoMercator()
        .scale(mapConfig.scale)
        .center(mapConfig.center)
        .translate([mapConfig.hawaii.x, mapConfig.hawaii.y]);

    // Create path generator
    const pathGenerator = d3.geoPath().projection(projection);

    // Convert Hawaii coordinates to pixel position
    const hawaiiPosition = projection(mapConfig.center);

    // Set base station position to Hawaii
    baseStation.x = hawaiiPosition[0];
    baseStation.y = hawaiiPosition[1];

    // Function to initialize the visualization
    function initVisualization() {
        // Create main SVG container if it doesn't exist
        if (!container) {
            container = d3.select('#visualization')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', '#b3d9ff');  // Ocean blue background
        }

        // Add time display container
        const timeDisplay = d3.select('#visualization')
            .append('div')
            .attr('id', 'timeDisplay')
            .style('position', 'absolute')
            .style('top', '20px')
            .style('left', '20px')
            .style('z-index', '1000');

        // Load world map data
        d3.json('https://unpkg.com/world-atlas@2/countries-110m.json')
            .then(function(world) {
                // Draw countries
                const mapBackground = container.append('g')
                    .attr('class', 'map-background');

                mapBackground.selectAll('path')
                    .data(topojson.feature(world, world.objects.countries).features)
                    .enter()
                    .append('path')
                    .attr('d', pathGenerator)
                    .style('fill', '#e0e0e0')  // Light gray for land
                    .style('stroke', '#999')
                    .style('stroke-width', '0.5px');

                // Highlight Hawaii
                mapBackground.selectAll('.hawaii')
                    .data([topojson.feature(world, world.objects.countries).features.find(d => d.id === '840')])  // USA
                    .enter()
                    .append('path')
                    .attr('d', pathGenerator)
                    .style('fill', '#c2b280')  // Sandy color for Hawaii
                    .style('stroke', '#8b4513')
                    .style('stroke-width', '1px');

                // Initialize the dashboard after map is loaded
                updateDashboard();
                drawEspNodes();
                // Start the update interval
                setInterval(updateDashboard, SIMULATION_SPEED);
                requestAnimationFrame(animate);  // Start smooth ship animation
            });
    }

    // Initialize the visualization
    initVisualization();
});
