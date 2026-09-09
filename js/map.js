// Forest Map Generator
class ForestMap {
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.trees = [];
        this.rivers = [];
        this.rocks = [];
        this.bushes = [];
        
        this.generate();
    }

    generate() {
        // Generate trees
        const treeCount = Math.floor((this.width * this.height) / 15000);
        for (let i = 0; i < treeCount; i++) {
            this.trees.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: 30 + Math.random() * 40,
                type: Math.floor(Math.random() * 3),
                opacity: 0.6 + Math.random() * 0.4
            });
        }

        // Generate rivers
        const riverCount = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < riverCount; i++) {
            const river = {
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                width: 40 + Math.random() * 60,
                length: 200 + Math.random() * 300,
                angle: Math.random() * Math.PI * 2
            };
            this.rivers.push(river);
        }

        // Generate rocks
        const rockCount = 20 + Math.floor(Math.random() * 30);
        for (let i = 0; i < rockCount; i++) {
            this.rocks.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: 20 + Math.random() * 30
            });
        }

        // Generate bushes
        const bushCount = 30 + Math.floor(Math.random() * 50);
        for (let i = 0; i < bushCount; i++) {
            this.bushes.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: 15 + Math.random() * 25
            });
        }
    }

    render(ctx) {
        // Draw ground
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#228B22');
        gradient.addColorStop(1, '#006400');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw rivers
        ctx.fillStyle = 'rgba(65, 105, 225, 0.6)';
        this.rivers.forEach(river => {
            ctx.save();
            ctx.translate(river.x, river.y);
            ctx.rotate(river.angle);
            ctx.fillRect(-river.length/2, -river.width/2, river.length, river.width);
            ctx.restore();
        });

        // Draw bushes
        this.bushes.forEach(bush => {
            ctx.fillStyle = `rgba(34, 139, 34, ${0.5 + Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(bush.x, bush.y, bush.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw rocks
        this.rocks.forEach(rock => {
            ctx.fillStyle = '#696969';
            ctx.beginPath();
            ctx.arc(rock.x, rock.y, rock.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Rock highlight
            ctx.fillStyle = '#808080';
            ctx.beginPath();
            ctx.arc(rock.x - 5, rock.y - 5, rock.size/3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw trees (back layer)
        this.trees.forEach(tree => {
            if (tree.type === 0) {
                this.drawPineTree(ctx, tree.x, tree.y, tree.size, tree.opacity);
            } else if (tree.type === 1) {
                this.drawOakTree(ctx, tree.x, tree.y, tree.size, tree.opacity);
            } else {
                this.drawBirchTree(ctx, tree.x, tree.y, tree.size, tree.opacity);
            }
        });
    }

    drawPineTree(ctx, x, y, size, opacity) {
        ctx.save();
        ctx.globalAlpha = opacity;
        
        // Trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - size/10, y, size/5, size/2);
        
        // Leaves (triangles)
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < 3; i++) {
            const triangleSize = size * (1 - i * 0.2);
            const triangleY = y - i * size/3;
            
            ctx.beginPath();
            ctx.moveTo(x, triangleY - triangleSize);
            ctx.lineTo(x - triangleSize/2, triangleY);
            ctx.lineTo(x + triangleSize/2, triangleY);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }

    drawOakTree(ctx, x, y, size, opacity) {
        ctx.save();
        ctx.globalAlpha = opacity;
        
        // Trunk
        ctx.fillStyle = '#654321';
        ctx.fillRect(x - size/8, y, size/4, size/2);
        
        // Leaves (circle)
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(x, y - size/3, size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Leaves detail
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.arc(x - size/6, y - size/2, size/6, 0, Math.PI * 2);
        ctx.arc(x + size/6, y - size/3, size/7, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    drawBirchTree(ctx, x, y, size, opacity) {
        ctx.save();
        ctx.globalAlpha = opacity;
        
        // Trunk (white with black marks)
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(x - size/12, y, size/6, size/2);
        
        // Black marks
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(x - size/12 + Math.random() * size/6, 
                        y + i * size/10, size/20, size/20);
        }
        
        // Leaves
        ctx.fillStyle = '#90EE90';
        ctx.beginPath();
        ctx.arc(x, y - size/3, size/2.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    checkCollision(x, y, radius) {
        // Check tree collision
        for (let tree of this.trees) {
            const dx = x - tree.x;
            const dy = y - tree.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius + tree.size/2) {
                return true;
            }
        }
        
        // Check rock collision
        for (let rock of this.rocks) {
            const dx = x - rock.x;
            const dy = y - rock.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < radius + rock.size) {
                return true;
            }
        }
        
        return false;
    }
}