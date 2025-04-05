import React from 'react';

const FilterSidebar = ({
  darkMode,
  showFilters,
  setShowFilters,
  selectedGarages,
  selectedVehicleTypes,
  selectedSeasons,
  selectedWidth,
  selectedProfile,
  selectedDiameter,
  shopSearchQuery,
  clearAllFilters,
  showGarageFilter,
  setShowGarageFilter,
  showVehicleTypeFilter,
  setShowVehicleTypeFilter,
  showSeasonFilter,
  setShowSeasonFilter,
  showSizeFilter,
  setShowSizeFilter,
  garages,
  toggleGarageFilter,
  getVehicleTypeDisplayName,
  toggleVehicleTypeFilter,
  getSeasonDisplayName,
  toggleSeasonFilter,
  widthOptions,
  profileOptions,
  diameterOptions,
  handleSizeFilterChange
}) => {
  return (
    <div className={`lg:w-1/4 ${darkMode ? "bg-[#0d1117]" : "bg-gray-50"} rounded-lg p-4 shadow-sm`}>
      {/* Filters header with toggle */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Szűrők</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-[#4e77f4] hover:text-[#5570c2] font-medium flex items-center"
        >
          {showFilters ? (
            <>
              <span className="text-sm cursor-pointer">Elrejtés</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </>
          ) : (
            <>
              <span className="text-sm cursor-pointer">Megjelenítés</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Clear all filters button */}
      {(selectedGarages.length > 0 || selectedVehicleTypes.length > 0 || selectedSeasons.length > 0 || 
        selectedWidth || selectedProfile || selectedDiameter || shopSearchQuery) && (
        <button
          onClick={clearAllFilters}
          className={`w-full mb-4 py-2 px-4 rounded-md text-sm font-medium ${
            darkMode ? "bg-[#252830] text-white hover:bg-[#353b48]" : "bg-gray-200 text-black hover:bg-gray-300"
          } flex items-center justify-center`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Összes szűrő törlése
        </button>
      )}

      {/* Filter content - conditionally visible with animation */}
      <div 
        className={`space-y-6 overflow-hidden transition-all duration-300 ease-in-out ${
          showFilters ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Garage filter section */}
        <div className="border-b-2 border-[#4e77f4]/80 pb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Szervízek</h3>
            <button
              onClick={() => setShowGarageFilter(!showGarageFilter)}
              className="text-[#4e77f4] hover:text-[#5570c2]"
            >
              {showGarageFilter ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
          
          {showGarageFilter && (
            <div className="space-y-2">
              <div 
                className={`flex items-center p-2 rounded-md cursor-pointer ${
                  selectedGarages.length === 0 
                    ? 'bg-[#4e77f4] text-white' 
                    : darkMode ? 'bg-[#252830] hover:bg-[#353b48] text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                }`}
                onClick={() => setSelectedGarages([])}
              >
                <span className="ml-2">Összes</span>
              </div>
              
              {garages.map(garage => (
                <div 
                  key={garage.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer ${
                    selectedGarages.includes(garage.id) 
                      ? 'bg-[#4e77f4] text-white' 
                      : darkMode ? 'bg-[#252830] hover:bg-[#353b48] text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                  }`}
                  onClick={() => toggleGarageFilter(garage.id)}
                >
                  <span className="ml-2">{garage.name}</span>
                  {selectedGarages.includes(garage.id) && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle type filter section */}
        <div className="border-b-2 border-[#4e77f4]/80 pb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Jármű típus</h3>
            <button
              onClick={() => setShowVehicleTypeFilter(!showVehicleTypeFilter)}
              className="text-[#4e77f4] hover:text-[#5570c2]"
            >
              {showVehicleTypeFilter ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
          
          {showVehicleTypeFilter && (
            <div className="space-y-2">
              <div 
                className={`flex items-center p-2 rounded-md cursor-pointer ${
                  selectedVehicleTypes.length === 0 
                    ? 'bg-[#4e77f4] text-white' 
                    : darkMode ? 'bg-[#252830] hover:bg-[#353b48] text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                }`}
                onClick={() => setSelectedVehicleTypes([])}
              >
                <span className="ml-2">Összes</span>
              </div>
              
              {['car', 'motorcycle', 'truck'].map(type => (
                <div 
                  key={type}
                  className={`flex items-center p-2 rounded-md cursor-pointer ${
                    selectedVehicleTypes.includes(type) 
                      ? 'bg-[#4e77f4] text-white' 
                      : darkMode ? 'bg-[#252830] hover:bg-[#353b48] text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                  }`}
                  onClick={() => toggleVehicleTypeFilter(type)}
                >
                  <span className="ml-2">{getVehicleTypeDisplayName(type)}</span>
                  {selectedVehicleTypes.includes(type) && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Season filter section */}
        <div className="border-b-2 border-[#4e77f4]/80 pb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Évszak</h3>
            <button
              onClick={() => setShowSeasonFilter(!showSeasonFilter)}
              className="text-[#4e77f4] hover:text-[#5570c2]"
            >
              {showSeasonFilter ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
          
          {showSeasonFilter && (
            <div className="space-y-2">
              <div 
                className={`flex items-center p-2 rounded-md cursor-pointer ${
                  selectedSeasons.length === 0 
                    ? 'bg-[#4e77f4] text-white' 
                    : darkMode ? 'bg-[#252830] hover:bg-[#353b48] text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                }`}
                onClick={() => setSelectedSeasons([])}
              >
                <span className="ml-2">Összes</span>
              </div>
              
              {['winter', 'summer', 'all_season'].map(season => (
                <div 
                  key={season}
                  className={`flex items-center p-2 rounded-md cursor-pointer ${
                    selectedSeasons.includes(season) 
                      ? 'bg-[#4e77f4] text-white' 
                      : darkMode ? 'bg-[#252830] hover:bg-[#353b48] text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                  }`}
                  onClick={() => toggleSeasonFilter(season)}
                >
                  <span className="ml-2">{getSeasonDisplayName(season)}</span>
                  {selectedSeasons.includes(season) && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tyre size filter section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Gumiméret</h3>
            <button
              onClick={() => setShowSizeFilter(!showSizeFilter)}
              className="text-[#4e77f4] hover:text-[#5570c2]"
            >
              {showSizeFilter ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
          
          {showSizeFilter && (
            <div className="space-y-4">
              {/* Width filter */}
              <div>
                <h4 className="text-sm font-medium mb-2">Szélesség (mm)</h4>
                <div className="flex flex-wrap gap-2">
                  {widthOptions.map(width => (
                    <button
                      key={`width-${width}`}
                      onClick={() => handleSizeFilterChange('width', width)}
                      className={`px-2 py-1 text-sm rounded-md ${
                        selectedWidth === width
                          ? 'bg-[#4e77f4] text-white'
                          : darkMode ? 'bg-[#252830] hover:bg-[#353b48] text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                      }`}
                    >
                      {width}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile filter */}
              <div>
                <h4 className="text-sm font-medium mb-2">Profil (%)</h4>
                <div className="flex flex-wrap gap-2">
                  {profileOptions.map(profile => (
                    <button
                      key={`profile-${profile}`}
                      onClick={() => handleSizeFilterChange('profile', profile)}
                      className={`px-2 py-1 text-sm rounded-md ${
                        selectedProfile === profile
                          ? 'bg-[#4e77f4] text-white'
                          : darkMode ? 'bg-[#252830] hover:bg-[#353b48] text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                      }`}
                    >
                      {profile}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diameter filter */}
              <div>
                <h4 className="text-sm font-medium mb-2">Átmérő (col)</h4>
                <div className="flex flex-wrap gap-2">
                  {diameterOptions.map(diameter => (
                    <button
                      key={`diameter-${diameter}`}
                      onClick={() => handleSizeFilterChange('diameter', diameter)}
                      className={`px-2 py-1 text-sm rounded-md ${
                        selectedDiameter === diameter
                          ? 'bg-[#4e77f4] text-white'
                          : darkMode ? 'bg-[#252830] hover:bg-[#353b48] text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                      }`}
                    >
                      {diameter}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;