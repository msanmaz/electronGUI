import React from 'react'
import Spinner from '../../common/spinner/Spinner'
import './childBox.css'

const ChildBox = ({headline,value=0}) => {
    return(
        <div className={`child-box ${headline === 'Alerts' ? 'alert-color' : ''}`}>
            <div className="headline">
                {headline}
            </div>

            <div className={`value ${headline === 'Alerts' ? 'alert-value' : ''}`}>
                {value === 0 ? <Spinner/> : value}
            </div>
        </div>
    )
}

export default ChildBox