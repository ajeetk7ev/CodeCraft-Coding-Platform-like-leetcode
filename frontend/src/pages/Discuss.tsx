import React from "react";
import Navbar from "../components/common/Navbar";
import ComingSoon from "../components/common/ComingSoon";

const Discuss: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            <ComingSoon
                title="Discuss Coming Soon"
                description="Connect with fellow coders, share solutions, and ask questions. Our community forum is under construction and will be live shortly!"
            />
        </div>
    );
};

export default Discuss;
