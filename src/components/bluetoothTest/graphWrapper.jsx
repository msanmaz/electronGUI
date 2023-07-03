/* eslint-disable react-refresh/only-export-components */
import React from 'react'
import LeftGraph from './leftGraph'
import RightGraph from './rightGraph';

function GraphWrapper({setIsZeroSession,isZeroSessionRef}) {

      
  return (
    <div className='flex flex-row'>
    <LeftGraph  setIsZeroSession={setIsZeroSession} isZeroSessionRef={isZeroSessionRef}/>
    <RightGraph setIsZeroSession={setIsZeroSession}  isZeroSessionRef={isZeroSessionRef}/>
    </div>
  
  )
}

export default React.memo(GraphWrapper)