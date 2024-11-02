import './App.css'
import ChatComponent from './components/ChatComponent'

function App() {

  return (
    <div className='p-12'>
      <div className='flex flex-row'>
        <div className='flex flex-col justify-start bg-white bg-opacity-20 rounded-3xl p-6'>
          <h1 className='text-2xl'>AI-powered Portfolio Creator</h1>
          <h2 className='opacity-60'>Anyone can invest.</h2>
        </div>
      </div>
      <div className='pt-12 px-4 flex items-center align-middle justify-center'>
        <div className='w-4/5'>
          <ChatComponent />
        </div>
      </div>
    </div>
  )
}

export default App
