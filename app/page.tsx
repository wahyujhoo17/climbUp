"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Search, LineChart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,
      },
    },
  };

  const featureCardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.2 + 0.5,
        duration: 0.7,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-16 text-center px-4 overflow-hidden">
      {/* Initial loading animation */}
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="fixed inset-0 bg-background flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 10, 0, -10, 0],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-4xl font-bold text-primary mb-4"
            >
              ClimbUp
            </motion.div>
            <motion.div
              animate={{ scaleX: [0, 1] }}
              transition={{ duration: 1 }}
              className="h-1 w-32 bg-primary rounded-full"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Main content with animations */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl"
        >
          Track Your Journey to Your
          <motion.span
            className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0%", "100%"],
              opacity: [0.9, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {" "}
            Dream Job
          </motion.span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mx-auto max-w-[600px] text-muted-foreground md:text-xl"
        >
          ClimbUp helps you organize your job search, track applications, and
          visualize your progress towards landing your perfect role.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild size="lg">
              <Link href="/search">
                Get Started
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    repeatDelay: 1,
                  }}
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.div>
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl"
      >
        {[
          {
            icon: <Search className="h-12 w-12 text-primary" />,
            title: "Job Search",
            description:
              "Find opportunities that match your skills and aspirations",
            index: 0,
          },
          {
            icon: <Briefcase className="h-12 w-12 text-primary" />,
            title: "Application Tracking",
            description: "Keep track of your applications and their status",
            index: 1,
          },
          {
            icon: <LineChart className="h-12 w-12 text-primary" />,
            title: "Progress Analytics",
            description:
              "Visualize your job search progress with detailed analytics",
            index: 2,
          },
        ].map((feature) => (
          <motion.div
            key={feature.title}
            custom={feature.index}
            variants={featureCardVariants}
            whileHover={{
              y: -5,
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            className="rounded-2xl bg-card p-6 shadow-lg transition-all duration-300"
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 1.5,
                delay: feature.index * 0.2 + 1,
                repeat: 1,
                repeatDelay: 5,
              }}
            >
              {feature.icon}
            </motion.div>
            <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
            <p className="mt-2 text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Floating elements for visual interest */}
      <motion.div
        className="absolute top-20 right-20 w-24 h-24 rounded-full bg-primary/5"
        animate={{
          y: [0, 30, 0],
          x: [0, 15, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-16 h-16 rounded-full bg-accent/5"
        animate={{
          y: [0, -20, 0],
          x: [0, -10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
}
