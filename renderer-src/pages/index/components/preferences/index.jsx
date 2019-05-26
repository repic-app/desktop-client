import React, { useContext } from 'react'
import Switch from 'components/switch'
import Select from 'components/select'
import APPContext from 'store/index'
import './styles.scss'

export default React.memo(() => {

  const { preferences, setPreferences } = useContext(APPContext)

  const handleChange = (value, name) => {
    setPreferences({ [name]: value })
  }

  return (
    <div className="component-preferences">
      <div className="options">
        <div className="option-group">
          <label className="label">压缩质量</label>
          <div className="option">
            <Select value={`${preferences.outputQuality}`} name="outputQuality" onChange={handleChange}>
              <option value="0.3" key={0}>极低</option>
              <option value="0.5" key={1}>低</option>
              <option value="0.6" key={2}>中</option>
              <option value="0.8" key={3}>高</option>
              <option value="1" key={4}>无损</option>
            </Select>
          </div>
        </div>
        <div className="option-group">
          <label className="label">尝试修正图片方向</label>
          <div className="option">
            <Switch checked={preferences.tryFixOrientation} name="tryFixOrientation" onChange={handleChange} />
          </div>
        </div>
        <div className="option-group">
          <label className="label">抹除图片元信息</label>
          <div className="option">
            <Switch checked={preferences.wipeMetadata} name="wipeMetadata" onChange={handleChange} />
          </div>
        </div>
        <div className="option-group">
          <label className="label">并行压缩数量</label>
          <div className="option">
            <Select value={`${preferences.parallelTaskCount}`} name="parallelTaskCount" onChange={handleChange} >
              <option value="1" key={0}>1</option>
              <option value="3" key={1}>3</option>
              <option value="5" key={2}>5</option>
              <option value="8" key={3}>8</option>
              <option value="10" key={4}>10</option>
            </Select>
          </div>
        </div>
        <div className="option-group">
          <label className="label">操作音效</label>
          <div className="option">
            <Switch checked={preferences.soundEffects} name="soundEffects" onChange={handleChange} />
          </div>
        </div>
      </div>
    </div>
  )

})