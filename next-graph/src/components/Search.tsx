"use client";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import graphData from "@/summarizedGraphData.json";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";

interface Node {
  id: string;
  data: {
    name: string;
    major: string;
    response: string;
    topMatch: string;
    originalResponse: string;
  };
}

interface CustomNode extends Node {
  links: { source: string; target: string }[];
}

// Create hashmap of id -> node and attach links to each node
const nodeMap = new Map<string, CustomNode>();
graphData.nodes.forEach((node) => {
  nodeMap.set(node.id, {
    ...node,
    links: [],
  });
});

graphData.links.forEach((link) => {
  const sourceNode = nodeMap.get(link.source);
  const targetNode = nodeMap.get(link.target);

  if (sourceNode) {
    sourceNode.links.push(link);
  }

  if (targetNode) {
    targetNode.links.push(link);
  }
});

// For all empty links in the nodemap add their best match
nodeMap.forEach((node) => {
  if (node.links.length === 0) {
    const bestMatch = nodeMap.get(node.data.topMatch);
    if (bestMatch) {
      nodeMap.set(node.id, {
        ...node,
        links: [
          {
            source: node.id,
            target: bestMatch.id,
          },
        ],
      });
    }
  }
});

export const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Node[]>([]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const results = graphData.nodes.filter((node) =>
      node.data.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  }, [searchTerm]);

  return (
    <div className="font-untitled-sans max-w-2xl">
      <Input
        className="text-lg mt-4 font-tiempos-headline"
        placeholder="Search for a person"
        onChange={handleSearch}
      />
      <div className="mt-2 flex flex-col gap-4">
        {searchResults.map((item) => {
          const currentNode = nodeMap.get(item.id);
          const neighbors = currentNode?.links.map((link) => {
            const neighborNode = nodeMap.get(
              link.source === item.id ? link.target : link.source
            );

            return neighborNode;
          });

          const major = item.data.major === "N/A" ? "" : item.data.major;

          return (
            <Dialog key={`entry-${item.id}`}>
              <DialogTrigger className="bg-slate-50 rounded p-4 text-left">
                <h2 className="font-medium text-lg font-tiempos-headline">
                  {item.data.name}
                </h2>
                <p className="font-tiempos-headline font-light text-stone-700">
                  {major}
                </p>
                <p className="text-sm text-stone-500">{item.data.response}</p>
              </DialogTrigger>
              <DialogContent className="w-full min-h-[30rem]">
                <DialogHeader>
                  <DialogTitle>Potential Connections</DialogTitle>
                  {/* <DialogDescription>asdf</DialogDescription> */}
                </DialogHeader>

                <div className="h-[60vh] overflow-y-scroll">
                  {neighbors?.map((neighbor) => {
                    return (
                      <div
                        key={`${neighbor?.id}-node-${item.id}`}
                        className="mt-4"
                      >
                        <h2 className="font-medium text-lg font-tiempos-headline">
                          {neighbor?.data.name}
                        </h2>
                        <p className="font-tiempos-headline font-light text-stone-700">
                          {neighbor?.data.major}
                        </p>
                        <p className="text-sm text-stone-500">
                          {neighbor?.data.response}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* <DialogFooter>
              <button type="submit">Save changes</button>
            </DialogFooter> */}
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
};
