import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TreeOfLifeProps {
  entryCount: number;
  activityLevel: number;
  stats?: {
    avgMood: number;
    totalCreative: number;
    totalStress: number;
    totalClarity: number;
    checklistComplete: number;
  }
}

export const TreeOfLife: React.FC<TreeOfLifeProps> = ({ 
  entryCount, 
  activityLevel, 
  stats = { avgMood: 5, totalCreative: 0, totalStress: 0, totalClarity: 0, checklistComplete: 0 } 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    const growthStage = Math.min(Math.log(Math.max(entryCount, 1) + 1) * 3 + 3, 16); 
    const moodColor = d3.interpolateLab("#a8a29e", "#426842")(stats.avgMood / 10);
    const stressFactor = Math.min(stats.totalStress / 50, 1);
    
    const defs = svg.append("defs");
    
    // Removed blue ground gradients and rectangles to ensure no "line" appears at bottom
    
    // Recursive Tree Function
    const drawTree = (selection: any, len: number, angle: number, branchWidth: number, depth: number) => {
        if (depth <= 0) {
            if (len < 10) {
                selection.append("circle")
                    .attr("r", Math.random() * 2 + 1)
                    .attr("fill", moodColor)
                    .attr("opacity", 0.4 + Math.random() * 0.3);
            }
            return;
        }

        const branchColor = d3.interpolateLab("#57534e", "#292524")(stressFactor);
        
        selection.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", -len)
            .attr("stroke", branchColor)
            .attr("stroke-width", branchWidth)
            .attr("stroke-linecap", "round")
            .attr("opacity", 0.8);

        const endOfBranch = selection.append("g").attr("transform", `translate(0, ${-len})`);

        if (stressFactor > 0.6 && Math.random() > 0.95 && depth < 3) {
           endOfBranch.append("circle")
              .attr("r", branchWidth * 1.2)
              .attr("fill", "#44403c")
              .attr("opacity", 0.5);
        }
        
        const fruitChance = Math.min(stats.checklistComplete / 150, 0.3);
        if (depth === 1 && Math.random() < fruitChance) {
             endOfBranch.append("circle")
                .attr("r", 2 + Math.random() * 2)
                .attr("fill", "#fb923c")
                .attr("opacity", 0.8);
        }

        const branchCount = Math.random() > 0.4 ? 2 : 3;
        
        for (let i = 0; i < branchCount; i++) {
           const rotate = (Math.random() * 50 - 25) + (i === 0 ? -15 : 15);
           const shorten = 0.7 + Math.random() * 0.15;
           const thin = 0.65;
           
           endOfBranch.append("g")
              .attr("transform", `rotate(${rotate})`)
              .call((s: any) => drawTree(s, len * shorten, angle, branchWidth * thin, depth - 1));
        }
    };

    const rootGroup = svg.append("g").attr("transform", `translate(${width/2}, ${height - 20})`);
    
    drawTree(rootGroup, height / 6, 0, growthStage / 1.5, Math.ceil(growthStage / 2));

    const birdCount = Math.min(Math.floor(stats.totalCreative / 8), 10);
    for(let i=0; i<birdCount; i++) {
        const bx = Math.random() * width;
        const by = Math.random() * (height/2);
        svg.append("text")
           .attr("x", bx)
           .attr("y", by)
           .text("~")
           .attr("font-size", 8 + Math.random() * 6)
           .attr("fill", "#a8a29e")
           .attr("opacity", 0.4);
    }

  }, [entryCount, activityLevel, stats]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none mix-blend-multiply opacity-60">
        <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
