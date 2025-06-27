const Hero = () => {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-8 py-12 bg-gray-50">
      <div className="md:w-1/2 space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          Scan & Detect{" "}
          <span className="text-pink-600">Deepfake</span> Videos
        </h1>
        <p className="text-gray-700 text-lg">
          <strong>Scan</strong> a suspicious video to find out if it’s synthetically manipulated.
          <br />
          <strong>Contact Us</strong> for on-premise solutions.
        </p>
        <button className="bg-pink-600 text-white px-6 py-3 rounded-md hover:bg-pink-700 transition">
          GO TO SCANNER
        </button>
      </div>
      <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
        <video controls className="rounded-md shadow-md w-full max-w-md">
          <source src="/demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
};

export default Hero;
