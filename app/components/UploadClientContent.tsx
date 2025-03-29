'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import CircularProgress from './CircularProgress';
import JsonDataViewer from './JsonDataViewer';

interface UploadClientContentProps {
  userId: string;
}

// JSON文件格式验证
function validateJsonFile(fileContent: string): { 
  valid: boolean; 
  error?: string; 
  data?: any[]; 
  validCount?: number;
  totalCount?: number;
} {
  try {
    // 尝试解析JSON
    const data = JSON.parse(fileContent);
    
    // 检查数据是否为数组
    if (!Array.isArray(data)) {
      return { valid: false, error: 'JSON格式有效，但内容不是数组格式' };
    }
    
    // 检查是否为空数组
    if (data.length === 0) {
      return { valid: false, error: '数组为空，没有数据记录' };
    }
    
    // 检查必填字段
    const requiredFields = ['id'];
    const validRecords = data.filter(item => {
      return requiredFields.every(field => item && item[field]);
    });
    
    if (validRecords.length === 0) {
      return { 
        valid: false, 
        error: '没有发现有效记录，请确保每条记录包含ID字段' 
      };
    }
    
    // 检查数据格式和类型
    const validationErrors: string[] = [];
    let hasErrors = false;
    
    data.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        validationErrors.push(`第${index + 1}条记录不是有效对象`);
        hasErrors = true;
        return;
      }
      
      // 检查必填字段
      for (const field of requiredFields) {
        if (!item[field]) {
          validationErrors.push(`第${index + 1}条记录缺少必填字段：${field}`);
          hasErrors = true;
        }
      }
    });
    
    if (hasErrors) {
      // 最多显示5个错误
      const errorMessage = validationErrors.slice(0, 5).join('\n') + 
        (validationErrors.length > 5 ? `\n...还有${validationErrors.length - 5}个问题` : '');
      return { valid: false, error: errorMessage };
    }
    
    return { 
      valid: true, 
      data: validRecords,
      validCount: validRecords.length,
      totalCount: data.length
    };
  } catch (error) {
    return { valid: false, error: '无效的JSON格式：' + (error instanceof Error ? error.message : '未知错误') };
  }
}

export default function UploadClientContent({ userId }: UploadClientContentProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [pasteContent, setPasteContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [fileValidationStatus, setFileValidationStatus] = useState<{[key: string]: {valid: boolean, message?: string}}>({});
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [showDataViewer, setShowDataViewer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles: File[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        // 只接受.json文件或MIME类型为application/json的文件
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          newFiles.push(file);
        } else {
          toast.error(`"${file.name}" 不是有效的JSON文件`);
        }
      }
      
      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
        // 自动验证新添加的文件
        validateFiles(newFiles);
      }
    }
  };

  const validateFiles = async (filesToValidate: File[]) => {
    for (const file of filesToValidate) {
      try {
        const content = await readFileAsText(file);
        const validation = validateJsonFile(content);
        
        setFileValidationStatus(prev => ({
          ...prev,
          [file.name]: {
            valid: validation.valid,
            message: validation.valid 
              ? `包含${validation.validCount}条有效记录，共${validation.totalCount}条` 
              : validation.error
          }
        }));
      } catch (error) {
        setFileValidationStatus(prev => ({
          ...prev,
          [file.name]: {
            valid: false,
            message: '读取文件时出错'
          }
        }));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    const newFiles: File[] = [];
    
    for (let i = 0; i < droppedFiles.length; i++) {
      const file = droppedFiles[i];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        newFiles.push(file);
      } else {
        toast.error(`"${file.name}" 不是有效的JSON文件`);
      }
    }
    
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      // 自动验证新添加的文件
      validateFiles(newFiles);
    }
  };

  const processAndUploadData = async (jsonData: any) => {
    try {
      // 发送数据到服务器
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          data: jsonData
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(`成功导入 ${result.count} 条记录${result.duplicates > 0 ? `，包含 ${result.duplicates} 条重复记录` : ''}`);
        return { success: true, result };
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || '上传失败，请重试');
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('上传错误:', error);
      toast.error('上传过程中发生错误，请重试');
      return { success: false, error: '网络错误或服务器异常' };
    }
  };

  const parseAllFiles = async () => {
    if (files.length === 0) {
      toast.error('请先选择文件');
      return;
    }

    const validFiles = Object.entries(fileValidationStatus)
      .filter(([name, status]) => status.valid)
      .map(([name]) => files.find(f => f.name === name))
      .filter(f => f) as File[];
    
    if (validFiles.length === 0) {
      toast.error('没有有效的文件可以解析，请先验证文件格式');
      return;
    }

    setIsProcessing(true);
    const allData: any[] = [];

    try {
      for (const file of validFiles) {
        try {
          // 读取文件内容
          const fileContent = await readFileAsText(file);
          const validation = validateJsonFile(fileContent);
          
          if (validation.valid && validation.data) {
            allData.push(...validation.data);
          }
        } catch (error) {
          console.error(`解析文件 ${file.name} 时出错:`, error);
        }
      }
      
      if (allData.length > 0) {
        setParsedData(allData);
        setShowDataViewer(true);
        toast.success(`成功解析 ${allData.length} 条记录`);
      } else {
        toast.error('未能从文件中解析出有效数据');
      }
    } catch (error) {
      console.error('解析文件时出错:', error);
      toast.error('解析文件时发生错误');
    } finally {
      setIsProcessing(false);
    }
  };

  const parsePastedContent = async () => {
    if (!pasteContent.trim()) {
      toast.error('请先粘贴JSON内容');
      return;
    }

    setIsProcessing(true);

    try {
      // 验证粘贴的内容
      const validation = validateJsonFile(pasteContent);
      
      if (!validation.valid || !validation.data) {
        toast.error(validation.error || 'JSON格式验证失败');
        setIsProcessing(false);
        return;
      }
      
      setParsedData(validation.data);
      setShowDataViewer(true);
      toast.success(`成功解析 ${validation.data.length} 条记录`);
    } catch (error) {
      console.error('处理粘贴内容时出错:', error);
      toast.error('处理粘贴内容时出错，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async () => {
    if (files.length === 0) {
      toast.error('请先选择文件');
      return;
    }

    // 先解析所有文件，然后显示数据预览
    await parseAllFiles();
  };

  const handleConfirmUpload = async (dataToUpload: any[]) => {
    if (!dataToUpload || dataToUpload.length === 0) {
      toast.error('没有选择需要上传的数据');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setShowDataViewer(false);

    try {
      // 分批上传数据以避免请求过大
      const batchSize = 500; // 每批处理的记录数
      let successCount = 0;
      
      for (let j = 0; j < dataToUpload.length; j += batchSize) {
        const batch = dataToUpload.slice(j, Math.min(j + batchSize, dataToUpload.length));
        
        // 上传批次数据
        const uploadResult = await processAndUploadData(batch);
        
        if (uploadResult.success) {
          successCount += uploadResult.result.count;
        }
        
        // 更新进度
        const progress = Math.min(100, Math.floor((j + batch.length) / dataToUpload.length * 100));
        setUploadProgress(progress);
      }
      
      // 上传完成
      setTimeout(() => {
        setIsUploading(false);
        setFiles([]);
        setFileValidationStatus({});
        setParsedData([]);
        toast.success(`成功上传 ${successCount} 条记录`);
      }, 500);
    } catch (error) {
      console.error('上传数据时出错:', error);
      setIsUploading(false);
      toast.error('上传数据时发生错误，请重试');
    }
  };

  const handlePasteUpload = async () => {
    if (!pasteContent.trim()) {
      toast.error('请先粘贴JSON内容');
      return;
    }

    // 解析粘贴的内容并显示数据预览
    await parsePastedContent();
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove) {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      
      // 从验证状态中移除
      const newStatus = { ...fileValidationStatus };
      delete newStatus[fileToRemove.name];
      setFileValidationStatus(newStatus);
    }
  };

  const validateFile = async (index: number) => {
    const file = files[index];
    if (!file) return;
    
    try {
      setFileValidationStatus(prev => ({
        ...prev,
        [file.name]: {
          valid: false,
          message: '正在验证...'
        }
      }));
      
      const content = await readFileAsText(file);
      const validation = validateJsonFile(content);
      
      setFileValidationStatus(prev => ({
        ...prev,
        [file.name]: {
          valid: validation.valid,
          message: validation.valid 
            ? `包含${validation.validCount}条有效记录，共${validation.totalCount}条` 
            : validation.error
        }
      }));
      
      if (validation.valid) {
        toast.success(`文件 ${file.name} 验证通过`);
      } else {
        toast.error(`文件 ${file.name} 验证失败: ${validation.error}`);
      }
    } catch (error) {
      setFileValidationStatus(prev => ({
        ...prev,
        [file.name]: {
          valid: false,
          message: '验证时出错'
        }
      }));
      toast.error(`验证文件 ${file.name} 时出错`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">数据上传</h1>
        <p className="text-lg text-gray-600">上传JSON格式的招标数据，系统将自动解析并导入到数据库</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        {/* 选项卡 */}
        <div className="flex border-b mb-6">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'file' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('file')}
          >
            文件上传
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'paste' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('paste')}
          >
            内容粘贴
          </button>
        </div>

        {activeTab === 'file' ? (
          <>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleSelectFile}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".json" 
                onChange={handleFileChange}
                multiple 
              />
              
              <div className="flex flex-col items-center justify-center">
                <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                
                <div>
                  <p className="text-lg font-semibold">点击或拖拽文件到此处上传</p>
                  <p className="text-sm text-gray-500 mt-2">支持批量上传多个 .json 格式文件</p>
                </div>
              </div>
            </div>

            {/* 文件列表 */}
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">待上传文件 ({files.length})</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center flex-1 mr-4">
                        <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                          {fileValidationStatus[file.name] && (
                            <p className={`text-xs mt-1 ${fileValidationStatus[file.name].valid ? 'text-green-600' : 'text-red-500'}`}>
                              {fileValidationStatus[file.name].message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            validateFile(index);
                          }}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="验证文件"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="删除文件"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isUploading && (
              <div className="mt-6 flex items-center justify-center flex-col">
                <div className="mb-4">
                  <CircularProgress 
                    progress={uploadProgress} 
                    size={80} 
                    strokeWidth={6}
                    progressColor="#0070F3"
                  />
                </div>
                <p className="text-center text-gray-600">
                  正在上传数据... {uploadProgress}%
                </p>
              </div>
            )}

            {isProcessing && (
              <div className="mt-6 flex items-center justify-center flex-col">
                <div className="mb-4">
                  <CircularProgress
                    progress={0}
                    isIndeterminate={true}
                    size={60}
                    strokeWidth={4}
                    progressColor="#0070F3"
                    showValue={false}
                  />
                </div>
                <p className="text-center text-gray-600">正在解析文件...</p>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleFileUpload}
                disabled={files.length === 0 || isUploading || isProcessing}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  files.length === 0 || isUploading || isProcessing
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isProcessing ? '解析中...' : '解析数据'}
              </button>
              
              {files.length > 0 && !isUploading && !isProcessing && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setFileValidationStatus({});
                  }}
                  className="ml-4 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                >
                  清空列表
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                粘贴JSON数据
              </label>
              <textarea
                className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="在此处粘贴JSON格式的数据..."
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="flex justify-center">
              {isProcessing ? (
                <div className="flex items-center justify-center flex-col">
                  <CircularProgress
                    progress={0}
                    isIndeterminate={true}
                    size={60}
                    strokeWidth={4}
                    progressColor="#0070F3"
                    showValue={false}
                  />
                  <p className="mt-2 text-gray-600">处理中...</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handlePasteUpload}
                    disabled={!pasteContent.trim() || isProcessing}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      !pasteContent.trim() || isProcessing
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    解析数据
                  </button>
                  
                  {pasteContent.trim() && (
                    <button
                      onClick={() => setPasteContent('')}
                      className="ml-4 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                    >
                      清空内容
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-semibold mb-4">数据格式说明</h2>
        
        <div className="mb-6">
          <p className="mb-3">上传的JSON数据需要包含以下字段：</p>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 overflow-auto max-h-64">
            <pre className="text-sm text-gray-700">
{`[
  {
    "id": "必填，招标项目唯一标识",
    "title": "可选，项目标题",
    "area": "可选，地区（省份）",
    "city": "可选，城市",
    "district": "可选，区县",
    "buyer": "可选，采购方名称",
    "buyerClass": "可选，采购方类型",
    "industry": "可选，行业分类",
    "publishTime": "可选，发布时间，格式：YYYY-MM-DD",
    "budget": "可选，预算金额（万元）",
    "bidAmount": "可选，中标金额（万元）",
    "detail": "可选，详细信息",
    "winner": "可选，中标方",
    "bidOpenTime": "可选，开标时间",
    "bidEndTime": "可选，投标截止时间",
    "signEndTime": "可选，报名截止时间",
    "buyerTel": "可选，采购方联系电话",
    "buyerPerson": "可选，采购方联系人",
    "agency": "可选，代理机构",
    "agencyTel": "可选，代理机构电话",
    "agencyPerson": "可选，代理机构联系人",
    "site": "可选，来源网站"
  }
]`}
            </pre>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          <p className="mb-2">注意事项：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>文件必须是有效的JSON格式</li>
            <li>数据应包含在一个数组中</li>
            <li>每条记录必须包含id字段，其他字段可以为空</li>
            <li>系统会自动合并相同ID的记录，合并时保留最完整的数据</li>
            <li>上传前可以在数据预览界面查看和编辑要上传的记录</li>
            <li>系统会自动处理数据格式，包括日期时间转换、字段长度调整和数据清洗</li>
          </ul>
        </div>
      </div>

      {showDataViewer && (
        <JsonDataViewer 
          data={parsedData} 
          onClose={() => setShowDataViewer(false)}
          onConfirmUpload={handleConfirmUpload}
        />
      )}
    </div>
  );
} 