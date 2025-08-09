'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-customBackground text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold tracking-tight">Developer Digital Twin</h1>
          </div>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Demo Sections</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {['Traditional API', 'AI-First API', 'Agent Interface'].map((section) => (
                      <li key={section}>
                        <NavigationMenuLink asChild>
                          <a
                            href={`#${section.toLowerCase().replace(/\s+/g, '-')}`}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100"
                          >
                            <div className="text-sm font-medium leading-none">{section}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-slate-500">
                              Explore the {section.toLowerCase()} demo section
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/about" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    About
                  </NavigationMenuLink>
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
            Agent-Responsive Design Demo
          </h2>
          <p className="mb-8 text-lg text-slate-700">
            Explore how digital interfaces can be designed to be &quot;bilingual&quot; - speaking
            clearly to both humans and AI agents, creating seamless experiences across both worlds.
          </p>
          <Button
            className="rounded-md bg-accent px-6 py-2.5 text-white hover:bg-blue-700"
            asChild
          >
            <Link href="#demo">Experience the Demo</Link>
          </Button>
        </div>
      </section>

      {/* Content Area */}
      <section id="demo" className="container mx-auto px-4 py-16 sm:px-6">
        <h3 className="mb-10 text-center text-2xl font-bold">Explore the Demo Sections</h3>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="overflow-hidden border shadow-sm transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle>Traditional API</CardTitle>
              <CardDescription>Standard error-based API responses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                See how traditional APIs communicate with minimal information, often requiring
                developers to handle generic error messages and codes.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="border-accent text-accent hover:bg-blue-50"
                asChild
              >
                <Link href="#traditional-api">View Section</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden border shadow-sm transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle>AI-First API</CardTitle>
              <CardDescription>Context-rich, action-oriented responses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Experience APIs designed with rich context, clear next steps, and machine-readable
                formats that both humans and AI agents can understand.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="border-accent text-accent hover:bg-blue-50"
                asChild
              >
                <Link href="#ai-first-api">View Section</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden border shadow-sm transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle>Agent Interface</CardTitle>
              <CardDescription>Direct machine-to-machine communication</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Observe how AI agents can interact with properly designed interfaces, extracting
                exactly what they need for autonomous operation.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="border-accent text-accent hover:bg-blue-50"
                asChild
              >
                <Link href="#agent-interface">View Section</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden border shadow-sm transition-all hover:shadow-md sm:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Side-by-Side Comparison</CardTitle>
              <CardDescription>Traditional vs. AI-First approaches</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Compare both API styles side-by-side to understand the differences in clarity,
                context, and actionability. See why AI-First design leads to better experiences for
                both humans and agents.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="bg-accent text-white hover:bg-blue-700" asChild>
                <Link href="#comparison">View Comparison</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500 sm:px-6">
          <p>Developer Digital Twin Demo - Agent-Responsive Design Principles</p>
          <p className="mt-2">© {new Date().getFullYear()} - All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
