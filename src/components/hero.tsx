//

export default function Hero() {
  return (
    <section className="flex-grow h-screen flex flex-col md:flex-row items-center justify-center px-6 md:px-12 lg:px-24 py-8 gap-8">
        <div className="flex-1 max-w-7xl ">
          <h1 className="text-4xl text-center md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-gray-300 mb-6">
            <span className="text-green-600">Fractional</span> Ownership of Renewable Energy Certificates
          </h1>
          <p className="text-lg text-gray-500 mb-8 text-center">
            Access the benefits of renewable energy investment with as little as $10. Own fractions of verified I-REC certificates and make a real environmental impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 my-12 justify-center items-center">
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md flex items-center justify-center gap-2 font-medium">
              Start Investing
            </button>
            <button className="px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2 font-medium">
              Explore Certificates
            </button>
          </div>
        </div>
    </section>
  )
}
