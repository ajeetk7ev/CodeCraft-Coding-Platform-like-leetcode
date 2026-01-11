import React from "react";
import Navbar from "../components/common/Navbar";
import ComingSoon from "../components/common/ComingSoon";

const Contests: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            <ComingSoon
                title="Contests Coming Soon"
                description="Gear up for thrilling coding battles! We're building a competitive environment where you can showcase your skills and climb the ranks."
            />
        </div>
    );
};

export default Contests;
