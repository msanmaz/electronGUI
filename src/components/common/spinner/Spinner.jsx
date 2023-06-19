import './spinner.css'

const Spinner = ({cls='',classnames}) => {
    return (
        <>
        <div className={`spinner-container ${classnames}`}>
<span className={`loaderTest ${cls}`}></span>

        </div>

        </>
        )
}

export default Spinner