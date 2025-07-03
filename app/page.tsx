'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SAMPLE_SOPS } from '@/lib/utils';
import { ArrowRight, Upload, Bot, BarChart3, CheckCircle } from 'lucide-react';

export default function Home() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Upload,
      title: 'Upload Your SOP',
      description: 'Simply upload your Standard Operating Procedure document',
      color: 'text-blue-600'
    },
    {
      icon: Bot,
      title: 'Generate Scenarios',
      description: 'AI automatically creates realistic test scenarios',
      color: 'text-green-600'
    },
    {
      icon: BarChart3,
      title: 'Run Simulations',
      description: 'Test your AI agents with automated simulations',
      color: 'text-purple-600'
    },
    {
      icon: CheckCircle,
      title: 'Get Insights',
      description: 'Receive detailed performance analysis and recommendations',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
          </div>
        </div>

        <div className="relative z-10 px-4 py-24 mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Test Your AI Agents
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Like Never Before
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 mb-12 max-w-3xl mx-auto leading-relaxed">
              Upload your SOPs, generate test scenarios, run simulations, and get detailed insights 
              into your AI agent performance—all in one seamless platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/demo">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                  Try Live Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-4 text-lg"
              >
                Watch Demo Video
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">95%</div>
                <div className="text-blue-200">Accuracy Improvement</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">10x</div>
                <div className="text-blue-200">Faster Testing</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">50+</div>
                <div className="text-blue-200">Test Scenarios</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform makes agent testing simple and effective
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`transition-all duration-300 cursor-pointer ${
                  hoveredFeature === index ? 'transform -translate-y-2 shadow-xl' : 'shadow-md'
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sample SOPs Section */}
      <section className="py-24 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Try With Sample SOPs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started immediately with our pre-loaded Standard Operating Procedures
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SAMPLE_SOPS.map((sop) => (
              <Card key={sop.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{sop.title}</CardTitle>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {sop.category}
                    </span>
                  </div>
                  <CardDescription>{sop.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-3 rounded text-sm text-gray-700 mb-4">
                    {sop.content.substring(0, 100)}...
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{sop.size}</span>
                    <Link href={`/demo?sop=${sop.id}`}>
                      <Button size="sm">
                        Try This SOP
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="px-4 mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your AI Agent Testing?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of teams already using our platform to improve their AI agents
          </p>
          <Link href="/demo">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
              Start Testing Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
