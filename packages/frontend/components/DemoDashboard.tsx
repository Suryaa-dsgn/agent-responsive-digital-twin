'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu';
import DeveloperCommandInterface from './DeveloperCommandInterface';
import { SemanticLayerDemo } from './SemanticLayerDemo';
import { APIEvolutionDemo } from './APIEvolutionDemo';

const GITHUB_REPO_URL = process.env.NEXT_PUBLIC_GITHUB_REPO_URL || 'https://github.com/your-username/your-repository-name';

// Demo sections for navigation
const DEMO_SECTIONS = [
  { id: 'command-interface', name: 'Developer Command Interface' },
  { id: 'semantic-layer', name: 'Semantic Layer Demo' },
  { id: 'api-evolution', name: 'API Evolution Demo' },
];

export default function DemoDashboard() {
  const [activeSection, setActiveSection] = useState<string>('');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Register section refs
  const registerSectionRef = (id: string, ref: HTMLElement | null) => {
    sectionRefs.current[id] = ref;
  };

  // Handle smooth scrolling
  const scrollToSection = (sectionId: string) => {
    const section = sectionRefs.current[sectionId];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Observe which section is currently visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header with fixed navigation */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold tracking-tight">AI Agent Demos</h1>
          </div>
          <NavigationMenu>
            <NavigationMenuList>
              {DEMO_SECTIONS.map((section) => (
                <NavigationMenuItem key={section.id}>
                  <NavigationMenuLink
                    className={`${navigationMenuTriggerStyle()} ${
                      activeSection === section.id ? 'bg-accent/30' : ''
                    }`}
                    onClick={() => scrollToSection(section.id)}
                  >
                    {section.name}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <Link href={GITHUB_REPO_URL} target="_blank" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>GitHub</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Agent-Responsive Design Demos
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Explore how digital interfaces can be designed to communicate effectively with both humans 
            and AI agents, creating seamless experiences across both worlds.
          </p>
          <Button
            size="lg"
            className="rounded-md px-6 py-2.5"
            onClick={() => scrollToSection('command-interface')}
          >
            Explore Demos
          </Button>
        </div>
      </section>

      {/* Developer Command Interface Section */}
      <section 
        id="command-interface" 
        ref={(el) => registerSectionRef('command-interface', el)}
        className="py-16 bg-muted/50"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h3 className="mb-3 text-3xl font-bold">Developer Command Interface</h3>
              <p className="mx-auto max-w-3xl text-muted-foreground">
                Experience how AI agents can understand natural language requests and translate them into actionable code.
                This interface allows developers to work with AI as an expert pair programming partner.
              </p>
            </div>
            <div className="relative">
              <Card className="border shadow-lg">
                <CardContent className="p-6">
                  <DeveloperCommandInterface />
                </CardContent>
              </Card>
              <div className="mt-8 text-center">
                <h4 className="text-xl font-semibold mb-2">Why This Matters</h4>
                <p className="text-muted-foreground">
                  Natural language interfaces eliminate the learning curve of complex development tools,
                  making programming more accessible while preserving power and flexibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Semantic Layer Demo Section */}
      <section 
        id="semantic-layer" 
        ref={(el) => registerSectionRef('semantic-layer', el)}
        className="py-16"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h3 className="mb-3 text-3xl font-bold">Semantic Layer Demo</h3>
              <p className="mx-auto max-w-3xl text-muted-foreground">
                Compare agent-friendly vs agent-hostile UI patterns. See how proper semantic markup 
                makes UI components understandable to both humans and AI agents.
              </p>
            </div>
            <Card className="border shadow-lg">
              <CardContent className="p-6">
                <SemanticLayerDemo />
              </CardContent>
            </Card>
            <div className="mt-8 text-center">
              <h4 className="text-xl font-semibold mb-2">Why This Matters</h4>
              <p className="text-muted-foreground">
                As AI agents become more integrated into digital experiences, semantic structure
                ensures they can understand user interfaces just as well as humans can.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API Evolution Demo Section */}
      <section 
        id="api-evolution" 
        ref={(el) => registerSectionRef('api-evolution', el)}
        className="py-16 bg-muted/50"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h3 className="mb-3 text-3xl font-bold">API Evolution Demo</h3>
              <p className="mx-auto max-w-3xl text-muted-foreground">
                Compare traditional API responses with AI-first approaches. See how rich, 
                structured responses enable autonomous agent operation without human intervention.
              </p>
            </div>
            <Card className="border shadow-lg">
              <CardContent className="p-6">
                <APIEvolutionDemo />
              </CardContent>
            </Card>
            <div className="mt-8 text-center">
              <h4 className="text-xl font-semibold mb-2">Why This Matters</h4>
              <p className="text-muted-foreground">
                AI-first APIs provide the context and actionable information agents need to self-correct 
                and continue operation, reducing the need for human intervention.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Future of Development Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="mb-6 text-3xl font-bold">The Future of Development</h3>
            <p className="mb-8 text-muted-foreground">
              These demos showcase how designing digital systems with both humans and AI agents in mind
              creates more powerful, accessible, and flexible development environments.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>Natural Language Interface</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Reduce cognitive load and learning curves by enabling natural language programming
                  </p>
                </CardContent>
              </Card>
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>Semantic Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create interfaces that communicate their purpose and functionality to agents
                  </p>
                </CardContent>
              </Card>
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>AI-First APIs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Design systems that enable autonomous operation with rich, actionable responses
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <p className="text-sm text-muted-foreground">AI Agent Demos - Agent-Responsive Design</p>
              <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} - All rights reserved</p>
            </div>
            <div className="flex space-x-6">
              <Link 
                href={GITHUB_REPO_URL} 
                target="_blank"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub Repository
              </Link>
              <Link 
                href="/docs" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Documentation
              </Link>
              <Link 
                href="/about" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
