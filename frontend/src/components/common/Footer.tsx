import { Code2, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
    return (
        <footer className="bg-gray-950 border-t border-gray-800 text-gray-300 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <Code2 className="text-indigo-400 h-8 w-8" />
                            <span className="text-xl font-bold tracking-tight text-white">
                                CodeArena
                            </span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            The ultimate platform to master coding interviews. Practice problems, compete in contests, and get hired by top tech companies.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Product</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/problems" className="hover:text-indigo-400 transition-colors">Problems</Link></li>
                            <li><Link to="/contests" className="hover:text-indigo-400 transition-colors">Contests</Link></li>
                            <li><Link to="/discuss" className="hover:text-indigo-400 transition-colors">Discuss</Link></li>
                            <li><Link to="/leaderboard" className="hover:text-indigo-400 transition-colors">Leaderboard</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Resources</h3>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Success Stories</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Interview Guide</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Stay Updated</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Join our newsletter for the latest problems and tech news.
                        </p>
                        <form className="flex flex-col gap-3">
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-gray-900 border-gray-800 text-white pl-10 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                                Subscribe
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} CodeArena. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
