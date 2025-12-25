import { Button } from '@/components/ui/button'
import { Play, Upload } from 'lucide-react'
import React from 'react'

function CodePanelHeader() {
  return (
    <div>  <div className="flex justify-between items-center px-4 py-2 bg-gray-900 border-b border-gray-800">
        <span className="text-sm text-gray-300">C++</span>

        <div className="flex gap-2">
          <Button size="sm" variant="ghost">
            <Play className="h-4 w-4 text-green-400" />
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Upload className="h-4 w-4 mr-1" />
            Submit
          </Button>
        </div>
      </div></div>
  )
}

export default CodePanelHeader